import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dashboardDir = path.resolve(__dirname, "..");
const componentsDir = path.resolve(__dirname, "../../../components");

/**
 * Source-level safety tests: ensure no window.location.href usage remains
 * in any dashboard page or component file. This catches regressions where
 * someone re-introduces full-page navigation instead of React Router's navigate().
 */

function getAllJsxFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "__tests__" && entry.name !== "node_modules") {
      files.push(...getAllJsxFiles(fullPath));
    } else if (entry.isFile() && /\.(jsx|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

describe("SPA Navigation Safety", () => {
  const dashboardFiles = getAllJsxFiles(dashboardDir);
  const componentFiles = getAllJsxFiles(componentsDir);
  const allFiles = [...dashboardFiles, ...componentFiles];

  it("found dashboard and component files to check", () => {
    expect(allFiles.length).toBeGreaterThan(0);
  });

  allFiles.forEach((filePath) => {
    const relativePath = path.relative(path.resolve(__dirname, "../../.."), filePath);

    it(`${relativePath} does not use window.location.href for navigation`, () => {
      const content = fs.readFileSync(filePath, "utf-8");

      // Find all window.location.href assignments (navigation)
      const matches = content.match(/window\.location\.href\s*=/g);

      if (matches) {
        // Allow window.location.href for external URLs or downloads only
        // Split content into lines for better error messages
        const lines = content.split("\n");
        const violatingLines = [];

        lines.forEach((line, index) => {
          if (/window\.location\.href\s*=/.test(line)) {
            // Allow if it's clearly an external URL (http://, https://)
            const isExternalUrl = /window\.location\.href\s*=\s*['"`]https?:\/\//.test(line);
            if (!isExternalUrl) {
              violatingLines.push({ line: index + 1, content: line.trim() });
            }
          }
        });

        expect(violatingLines).toEqual([]);
      }
    });
  });

  it("sidebar.jsx imports from react-router", () => {
    const sidebarPath = path.join(componentsDir, "sidebar.jsx");
    if (fs.existsSync(sidebarPath)) {
      const content = fs.readFileSync(sidebarPath, "utf-8");
      expect(content).toMatch(/from\s+['"]react-router['"]/);
    }
  });
});

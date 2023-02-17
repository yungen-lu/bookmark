import { Client, isFullPage, iteratePaginatedAPI } from "@notionhq/client";
import * as dotenv from "dotenv";
import * as yaml from "js-yaml";
import fs from "fs/promises";
import path from "path";
import type { DataBaseModel } from "./type";
import { convert, downloadFile } from "./util";
dotenv.config();
const notion_token = process.env.NOTION_TOKEN ?? "";
const notion_database_id = process.env.NOTION_DATABASE_ID ?? "";
if (notion_database_id === "") {
  console.error("notion database id not found");
  process.exit(1);
}
if (notion_token === "") {
  console.error("notion token not found");
  process.exit(1);
}
async function main() {
  const notion = new Client({
    auth: process.env.NOTION_TOKEN,
  });
  for await (const page of iteratePaginatedAPI(notion.databases.query, {
    database_id: notion_database_id,
  })) {
    if (isFullPage(page)) {
      const p = page.properties as DataBaseModel;
      const pageFrontMatter = convert(p);
      console.log(pageFrontMatter.imgUrL);
      const pathDir = path.join(
        "./",
        "content",
        "bookmarks",
        pageFrontMatter.title
      );
      // console.log(pathDir);
      const imgDir = path.join(pathDir, `${pageFrontMatter.title}-image.jpg`);
      await fs.mkdir(pathDir, { recursive: true });
      const checkExists = await fs
        .stat(imgDir)
        .then(() => true)
        .catch(() => false);
      if (!checkExists && pageFrontMatter.imgUrL) {
        console.log("downloading: ", imgDir);
        try {
          await downloadFile(pageFrontMatter.imgUrL, imgDir);
        } catch (err) {
          console.log(err);
        }
      }
      await fs.writeFile(
        path.join(pathDir, "index.md"),
        "---\n" + yaml.dump(pageFrontMatter) + "---\n"
      );
    } else {
      console.error("page wrong format");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

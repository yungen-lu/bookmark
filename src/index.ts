import { Client, isFullPage, iteratePaginatedAPI } from "@notionhq/client";
import {
  PageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import * as dotenv from "dotenv";
import * as yaml from "js-yaml";
import * as fs from "fs/promises";
type Properties = PageObjectResponse["properties"];
type PropertyLastEdited = Extract<
  Properties[string],
  { type: "last_edited_time" }
>;
type PropertyCreatedTime = Extract<
  Properties[string],
  { type: "created_time" }
>;
type PropertyUrl = Extract<Properties[string], { type: "url" }>;
type PropertyMutliSelect = Extract<
  Properties[string],
  { type: "multi_select" }
>;
type PropertyRichText = Extract<Properties[string], { type: "rich_text" }>;
type PropertyTitle = Extract<Properties[string], { type: "title" }>;
type DataBaseModel = {
  "Last edited time": PropertyLastEdited;
  imgUrl: PropertyUrl;
  Tags: PropertyMutliSelect;
  externalUrl: PropertyUrl;
  "Created time": PropertyCreatedTime;
  Description: PropertyRichText;
  Title: PropertyTitle;
};
type PageFrontMatter = {
  title: string;
  date: string;
  lastmod: string;
  description: string;
  tags: string[];
  externalUrL: string;
  imgUrL: string;
};
// type t = Extract<tmp, { type: "database_id" }>;
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
  // const response = await notion.databases.query({
  //   database_id: notion_database_id,
  // });
  // console.log(response);
  for await (const page of iteratePaginatedAPI(notion.databases.query, {
    database_id: notion_database_id,
  })) {
    if (isFullPage(page)) {
      const p = page.properties as DataBaseModel;
      // console.log(p.Title.title);
      const pageFrontMatter = convert(p);
      // console.log(yaml.dump(pageFrontMatter));
      await fs.writeFile(
        `./content/bookmarks/${pageFrontMatter.title}.md`,
        "---\n" + yaml.dump(pageFrontMatter) + "---\n"
      );
      // console.log(p.Tags.multi_select)
      // console.log(page.properties);
      // console.log(p);
    } else {
      console.error("page wrong format");
    }
  }
  // const page = response.results[0];
  // if (isFullPage(page)) {
  //   const p = page.properties as DataBaseModel;
  //   console.log(page.properties);
  //   console.log(p);
  // } else {
  //   console.error("page wrong format");
  // }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
function convert(data: DataBaseModel): PageFrontMatter {
  return {
    title: findText(data.Title.title),
    date: data["Created time"].created_time,
    lastmod: data["Last edited time"].last_edited_time,
    description: findText(data.Description.rich_text),
    tags: data.Tags.multi_select.map((el) => {
      return el.name;
    }),
    externalUrL: data.externalUrl.url ?? "",
    imgUrL: data.imgUrl.url ?? "",
  };
}
function findText(arr: RichTextItemResponse[]): string {
  const find = arr.find((el) => el.plain_text !== "");
  if (find) {
    return find.plain_text;
  } else {
    throw new Error("can't find text");
  }
}

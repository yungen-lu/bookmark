import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
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
type PropertySelect = Extract<Properties[string], { type: "select" }>;
export type DataBaseModel = {
  "Last edited time": PropertyLastEdited;
  imgUrl: PropertyUrl;
  Tags: PropertyMutliSelect;
  externalUrl: PropertyUrl;
  "Created time": PropertyCreatedTime;
  Description: PropertyRichText;
  Title: PropertyTitle;
  Categories: PropertySelect;
};
export type PageFrontMatter = {
  title: string;
  date: string;
  lastmod: string;
  description: string;
  tags: string[];
  Categories: string;
  externalUrL: string;
  imgUrL: string;
};

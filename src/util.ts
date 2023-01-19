import { DataBaseModel, PageFrontMatter } from "./type";
import { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints";
import stream from "stream";
import { promisify } from "util";
import { createWriteStream } from "fs";
import axios from "axios";
export function convert(data: DataBaseModel): PageFrontMatter {
  return {
    title: findText(data.Title.title),
    date: data["Created time"].created_time,
    lastmod: data["Last edited time"].last_edited_time,
    description: findText(data.Description.rich_text),
    tags: data.Tags.multi_select.map((el) => {
      return el.name;
    }),
    Categories: data.Categories.select?.name ?? "",
    externalUrL: data.externalUrl.url ?? "",
    imgUrL: data.imgUrl.url ?? "",
  };
}
export function findText(arr: RichTextItemResponse[]): string {
  const find = arr.find((el) => el.plain_text !== "");
  if (find) {
    return find.plain_text;
  } else {
    throw new Error("can't find text");
  }
}
const finished = promisify(stream.finished);

export async function downloadFile(
  fileUrl: string,
  outputLocationPath: string
): Promise<any> {
  if (fileUrl === "") {
    return;
  }
  const writer = createWriteStream(outputLocationPath);
  return axios({
    method: "get",
    url: fileUrl,
    responseType: "stream",
  })
    .then((response) => {
      response.data.pipe(writer);
      return finished(writer);
    })
    .catch((err) => {
      writer.destroy();
      throw err;
    });
}

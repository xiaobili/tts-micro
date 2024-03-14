import { Clipboard, showToast, getPreferenceValues, Toast, showHUD, showInFinder } from "@raycast/api";
import { join } from "path";
import { getNowTime } from "./utils";
import fetch from "node-fetch";
import fs from "fs";
import { Base64 } from "js-base64";

export default async () => {
  let selectedText: string | undefined;

  try {
    selectedText = await Clipboard.readText();
  } catch (error) {
    await showToast(Toast.Style.Failure, "请选中文字");
    return;
  }

  // 开始合成
  await showToast(Toast.Style.Animated, "开始合成");

  const { voice, server, directory, open } = getPreferenceValues();
  const tts = {
    text: Base64.encode(selectedText ? selectedText : ""),
    voice: voice,
  };

  const resp = await fetch(server, {
    method: "POST",
    body: JSON.stringify(tts),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await resp.arrayBuffer();
  const buffer = Buffer.from(data);

  const filename = `${getNowTime()}.mp3`;
  await fs.promises.writeFile(join(directory, filename), buffer);

  await showToast(Toast.Style.Success, "合成成功");
  await showHUD("合成成功");
  if (open) {
    await showInFinder(join(directory, filename));
  }
};

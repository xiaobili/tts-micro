import { getSelectedText, showToast, getPreferenceValues, Toast, showHUD, showInFinder } from "@raycast/api";
import axios from "axios";
import { join } from "path";
import { getNowTime } from "./date";
import fs from "fs";

export default async () => {
  let selectedText: string;

  try {
    selectedText = await getSelectedText();
  } catch (error) {
    await showToast(Toast.Style.Failure, "请选中文字");
    return;
  }

  // 开始合成
  await showToast(Toast.Style.Animated, "开始合成");

  const { voice, rate, pitch, server, directory, open } = getPreferenceValues();
  const tts = {
    text: selectedText,
    voice: voice,
    rate: "+" + rate + "%",
    pitch: "+" + pitch + "Hz",
  };

  console.log("tts", tts);
  console.log("server", server);

  const data = await axios.post(server, tts, {
    responseType: "arraybuffer",
  });

  const filename = `${getNowTime()}.mp3`;
  await fs.promises.writeFile(join(directory, filename), data.data);

  await showToast(Toast.Style.Success, "合成成功");
  await showHUD("合成成功");
  if (open) {
    await showInFinder(join(directory, filename));
  }
};

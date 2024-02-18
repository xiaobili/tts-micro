import { Clipboard, showToast, getPreferenceValues, Toast, showHUD, showInFinder } from "@raycast/api";
import axios from "axios";
import { join } from "path";
import { getNowTime } from "./utils";
import { Base64 } from "js-base64";
import ffmpeg from "fluent-ffmpeg";

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

  // console.log("tts", tts);
  // console.log("server", server);

  const data = await axios.post(server, tts, {
    responseType: "arraybuffer",
  });

  const filename = `${getNowTime()}.wav`;
  //await fs.promises.writeFile(join(directory, filename), data.data);

  const command = ffmpeg(data.data);

  command
    .toFormat("wav")
    .audioBitrate("192k")
    .audioChannels(2)
    .audioFrequency(16000)
    .on("error", async (err) => {
      console.log("An error occurred: " + err.message);
      await showToast(Toast.Style.Failure, "合成失败");
      await showHUD("合成失败");
    })
    .on("end", async () => {
      await showToast(Toast.Style.Success, "合成成功");
      await showHUD("合成成功");
      if (open) {
        await showInFinder(join(directory, filename));
      }
    })
    .save(join(directory, filename));
};

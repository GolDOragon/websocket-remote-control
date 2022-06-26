import Jimp from 'jimp';
import robot from 'robotjs';
import { Duplex } from 'stream';

export const makeScreenshot = async (ws: Duplex) => {
  const { x, y } = robot.getMousePos();
  const bitmap = robot.screen.capture(x, y, 200, 200);
  const image = new Jimp(bitmap.width, bitmap.height);
  const { width, height } = image.bitmap;

  await new Promise((res) => {
    let position = 0;

    image.scan(0, 0, width, height, (xPosition, yPosition, idx) => {
      /* eslint-disable @typescript-eslint/no-unsafe-assignment */
      /* eslint-disable @typescript-eslint/no-unsafe-member-access */
      /* eslint-disable @typescript-eslint/no-unsafe-call */
      image.bitmap.data[idx + 2] = bitmap.image.readUInt8(position++);
      image.bitmap.data[idx + 1] = bitmap.image.readUInt8(position++);
      image.bitmap.data[idx + 0] = bitmap.image.readUInt8(position++);
      image.bitmap.data[idx + 3] = bitmap.image.readUInt8(position++);
      /* eslint-enable @typescript-eslint/no-unsafe-assignment */
      /* eslint-enable @typescript-eslint/no-unsafe-member-access */
      /* eslint-enable @typescript-eslint/no-unsafe-call */

      if (xPosition === width - 1 && yPosition === height - 1) {
        res(undefined);
      }
    });
  });

  const result = await image.getBase64Async(Jimp.MIME_PNG);
  ws.write(`prnt_scrn ${result.split(';base64,')[1] || ''}`);
};

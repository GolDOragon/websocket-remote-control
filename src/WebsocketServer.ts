import robot from 'robotjs';
import { Duplex } from 'stream';

import { drawCircle, drawRectangle } from './drawMethods';
import { makeScreenshot } from './makeScreenshot';

export const socketHandler = (wsStream: Duplex) => async (data: Buffer) => {
  const [cmd, num = '', rectangleLength] = data.toString().split(' ');

  const { x: x1, y: y1 } = robot.getMousePos();
  const offset = parseFloat(num);

  wsStream.write(`${cmd || ''}\0`);
  switch (cmd) {
    case 'mouse_position':
      wsStream.write(`mouse_position {${x1}},{${y1}}`);
      break;

    case 'mouse_up':
      robot.moveMouseSmooth(x1, Math.max(y1 - offset, 0));
      break;
    case 'mouse_down':
      robot.moveMouseSmooth(x1, y1 + offset);
      break;
    case 'mouse_left':
      robot.moveMouseSmooth(Math.max(x1 - offset, 0), y1);
      break;
    case 'mouse_right':
      robot.moveMouseSmooth(x1 + offset, y1);
      break;

    case 'draw_square':
      drawRectangle(offset);
      break;

    case 'draw_rectangle':
      drawRectangle(offset, rectangleLength);
      break;

    case 'draw_circle':
      drawCircle(offset);
      break;

    case 'prnt_scrn':
      await makeScreenshot(wsStream);
  }
};

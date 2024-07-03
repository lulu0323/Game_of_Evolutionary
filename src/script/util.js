export function getRandomKey(randomNext, col, row) {
  let nextKey = {
    col: col,
    row: row,
  };
  switch (randomNext) {
    case 1:
      nextKey = {
        col: col - 1,
        row: row - 1,
      }
      break;
    case 2:
      nextKey = {
        col: col,
        row: row - 1,
      }
      break;
    case 3:
      nextKey = {
        col: col + 1,
        row: row - 1,
      }
      break;
    case 4:
      nextKey = {
        col: col - 1,
        row: row,
      }
      break;
    case 5:
      nextKey = {
        col: col + 1,
        row: row,
      }
      break;
    case 6:
      nextKey = {
        col: col - 1,
        row: row + 1,
      }
      break;
    case 7:
      nextKey = {
        col: col,
        row: row + 1,
      }
      break;
    case 8:
      nextKey = {
        col: col + 1,
        row: row + 1,
      }
      break;
  }
  return nextKey;
}

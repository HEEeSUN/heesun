export const refineSearchWord = async (searchWord: string): Promise<string> => {
  let refinedWord = searchWord;
  let tempStr = "";
  let tempArr = refinedWord.split(" ");
  tempArr.map((str, key) => {
    if (tempArr.length === key + 1) {
      tempStr += str;
    } else {
      tempStr += str + "%";
    }
  });
  refinedWord = tempStr;

  return refinedWord;
};

type Location = {line: number, column: number};


const excludedRangeDict = {
  comment: /(\/\/).*?(?=\n|$)/,
  multilineComment: /\/\*[\s\S]*?\*\//,
  string: /(['"`])(\\\1|[\s\S])*?\1/,
  regex: /\/(\\\/|[^\n])*?\//,
};

const searchInLine = (line: string, dict) => {
  const arr = [];
  for (let [type, regex] of dict) {
    for (let item of line.matchAll(new RegExp(regex, 'g'))) {
      arr.push({
        type: item[1],
        start: item.index || 0,
        end: (item.index || 0) + item[1].length,
      });
    }
  }
  return arr;
};

const search = (text: string, dict: any) =>
  text
    .split('\n')
    .map((L, line) => {
      line = line + 1;
      const ans = searchInLine(L, dict);
      return ans.map(item => {
        return {
          type: item.type,
          start : {line, column: item.start},
          end : {line, column: item.end}
        };
      });
    })
    .flatMap((item) => item);

export default (input: string): {type: string, start: Location, end: Location}[] => {
  const dictionary = [
    ['', /(const|let|var|type|interface)\s+[$\w\{\[]/],
    ['', /(export default)\s+([^:\s,])/],
    ['', /(return|export|import)\s+([^:\s,])/],
    // ['', /(true|false|undefined|null)([^:])/],
    ['', /(return)\s*(\n|;)/],
    // ['', /(function)\s+([^:\s,])/],
    // ['', /(\;)/],
  ];
  return search(input, dictionary);
};
//@ts-nocheck
import * as acornLoose from 'acorn-loose';
import * as acornWalk from 'acorn-walk';

type Location = {line: number, column: number};

const parse = (input: string): {type: string, start: Location, end: Location}[] => {
  let patches: any[] = [];
  let acornNodes = acornLoose.parse(input, {locations: true});

  acornWalk.full(acornNodes, node => {
    switch (node.type) {
      case 'VariableDeclaration':
        patches.push({
          // @ts-ignore
          type: node.kind,
          // @ts-ignore
          start: node.loc.start,
          end: {
            ...node.loc.start, 
            column: node.kind === 'const' 
              ? node.loc.start.column + 5
              : node.loc.start.column + 3
              
          },
        });
        break;
      case 'FunctionDeclaration':
      case 'FunctionExpression':
        patches.push({
          // @ts-ignore
          type: 'function',
          // @ts-ignore
          start: node.loc.start,
          //@ts-ignore
          end: {...node.loc.start, column: node.loc.start.column + 8},
        });
        break;
      case 'ReturnStatement':
        patches.push({
          // @ts-ignore
          type: 'return',
          // @ts-ignore
          start: node.loc.start,
          //@ts-ignore
          end: {...node.loc.start, column: node.loc.start.column + 6},
        });
        break;
        case 'ImportDeclaration':
          patches.push({
            // @ts-ignore
            type: 'import',
            // @ts-ignore
            start: node.loc.start,
            //@ts-ignore
            end: {...node.loc.start, column: node.loc.start.column + 6},
          });
          break;
          case 'ExportNamedDeclaration':
          case 'ExportDefaultDeclaration':
              patches.push({
            // @ts-ignore
            type: 'export',
            // @ts-ignore
            start: node.loc.start,
            //@ts-ignore
            end: {...node.loc.start, column: node.loc.start.column + 6},
          });
          break;
      default:
        break;
    }
  });

  return patches;
};

export default parse;
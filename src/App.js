import CodeEditor from "@uiw/react-textarea-code-editor";
import "./App.css";
import React from "react";
import { Col, Row } from "antd";
import { Input } from "antd";

function App() {
  const [listNormalVar, setListNormalVar] = React.useState([]);
  const [listTableVar, setListTableVar] = React.useState([]);
  const [prefix, setPrefix] = React.useState("");

  const handleChangeNormalField = React.useCallback((event) => {
    let value = event?.target?.value;
    var ar = value?.split(",");
    const convertedArray = ar.map((item) => item.trim().replace(/"/g, ""));
    setListNormalVar([...convertedArray]);
  }, []);

  const handleChangeTableField = React.useCallback((event) => {
    let value = event?.target?.value;
    var ar = value?.split(",");
    const convertedArray = ar.map((item) => item.trim().replace(/"/g, ""));
    setListTableVar([...convertedArray]);
  }, []);

  const handleChangePrefixField = React.useCallback((event) => {
    let value = event?.target?.value;
    setPrefix(value);
  }, []);

  const modifyVariable = React.useCallback(() => {
    const concatArr = [...listNormalVar, ...listTableVar];
    const arrRef = concatArr.map((str) => {
      const s = str.charAt(0).toUpperCase() + str.slice(1);
      return `${prefix}${s}Ref`;
    });
    return arrRef;
  }, [listNormalVar, listTableVar, prefix]);

  const arrRef = modifyVariable();

  const printArrRef = React.useCallback(() => {
    return ` const arrRef = [
    ${arrRef.map((o) => `${o},\n`).join("")}
  ];`;
  }, [arrRef]);

  const printDeclare = React.useCallback(() => {
    return arrRef
      .map((str) => {
        return `const ${str} = useRef(null);`;
      })
      .join("\n");
  }, [arrRef]);

  const tableArrErrsVar = React.useCallback(() => {
    const tableArrErrs = listTableVar.map((str) => {
      const s = str.charAt(0).toUpperCase() + str.slice(1);
      return `arrErrs${s}`;
    });
    return tableArrErrs;
  }, [listTableVar]);

  const tableArrErrsArray = tableArrErrsVar();

  const printTableGeneralErrs = React.useCallback(() => {
    const tableErrors = listTableVar
      .map((str) => {
        const s = str.charAt(0).toUpperCase() + str.slice(1);
        return `const arrErrs${s} = error.response.data
      .${str}
      ? error.response.data.${str}.map(
          (x: any) => x.errors
        )
      : []`;
      })
      .join(";");

    return ` const arrErrs = error.response.data.errors
    ? Object.keys(error.response.data.errors)
    : [];
    ${tableErrors};
    checkValidate(
      arrRef,
      arrErrs,
      ${listTableVar.map((str) => {
        const s = str.charAt(0).toUpperCase() + str.slice(1);
        return ` arrErrs${s}`;
      })});
    `;
  }, [listTableVar]);

  const printTableArrErrsVar = React.useCallback(() => {
    return tableArrErrsArray
      .map((str) => {
        return `${str}: Array<any>,`;
      })
      .join("");
  }, [tableArrErrsArray]);

  const printTabIndexJSX = React.useCallback(() => {
    const tabIndexJsx = arrRef
      .map((ref, index) => {
        return `
     <div
     tabIndex={${index}}
     className="w-100"
     ref={${ref}}
     ></div>
    `;
      })
      .join("");
    return tabIndexJsx;
  }, [arrRef]);

  const printCheckValidate = React.useCallback(() => {
    const checkValidate = `
    const checkValidate = (
      arrRef: Array<any>,
      arrErrs: Array<any>,
     ${printTableArrErrsVar()}
    ) => {
      const arrRefHere = [];
      //Lặp qua arr, nếu có tên thằng nào thì push ref của nó vào 1 mảng!
      for (let i = 0; i < arrErrs.length; i++) {
        ${listNormalVar
          .map((str, index) => {
            if (index === 0)
              return ` if (arrErrs[i] === "${str}") {
              arrRefHere.push(arrRef[0]);
            }`;
            else
              return ` else if (arrErrs[i] === "${str}") {
              arrRefHere.push(arrRef[${index}]);
            }`;
          })
          .join("")}
      }
      // Kiểm tra nếu trong table vật tư nếu có lỗi chưa nhập thì sẽ focus vào table
      ${tableArrErrsArray
        .map((arrError, index) => {
          return `
          if (${arrError}.length > 0) {
            // Vì ${arrError} luôn có length, khi kể cả không có lỗi thì nó sẽ trả ra null, nên phải check thêm đk dưới
            // Nếu tất cả khác null thì mới đẩy arrRefHere thêm phần ref của table
            if (!${arrError}.every((x: any) => x == null)) {
              arrRefHere.push(arrRef[${listNormalVar?.length + index}]);
            }
          };
          `;
        })
        .join("")}
      arrRefHere.sort(function (a, b) {
        if (
          Number(a.current.attributes[0].value) >
          Number(b.current.attributes[0].value)
        )
          return 1;
        if (
          Number(a.current.attributes[0].value) <
          Number(b.current.attributes[0].value)
        )
          return -1;
        return 0;
      });
      let refScrollHere: React.MutableRefObject<any>;
      refScrollHere = arrRefHere[0]; // Lấy ra thằng gần nhất
      if (refScrollHere) {
        const numberRefScrollHere = Number(
          refScrollHere.current.attributes[0].value
        ); // Lấy tabValue value thằng gần nhất
        //Nếu là input
        if (
          ${listNormalVar
            .map((str, index) => {
              return `numberRefScrollHere === ${index} ${
                index === listNormalVar?.length - 1 ? "" : "||"
              }`;
            })
            .join("")}
        
        ) {
          refScrollHere.current.children[0].children[1].children[0].children[0].focus();
        } ${tableArrErrsArray
          .map((arrError, index) => {
            return `
            else if (numberRefScrollHere === ${listNormalVar?.length + index}) {
              refScrollHere.current.focus();
              // Lặp qua tất cả thằng bị lỗi trong table
              for (let i = 0; i < ${arrError}.length; i++) {
                if (
                  ${arrError}[i] !== null &&
                  ${arrError}[i] !== undefined
                ) {
                  // Đoạn này lấy ra đúng thằng tr bị lỗi
                  const arrTdTable =
                    refScrollHere.current.children[0].children[0].children[0]
                      .children[0].children[0].children[0].children[0].children[0]
                      .children[2].children[i + 1].children;
                  //vì không thể custom được border bottom tr, nên phải lấy ra thằng td, đoạn này lặp qua tất cả thằng td để custom border
                  for (let z = 0; z < arrTdTable.length; z++) {
                    arrTdTable[z].classList.add("border-bottom-material");
                  }
                }
              }
            } 
            `;
          })
          .join("")} 
        //Nếu là select và table
        else {
          refScrollHere.current.focus();
        }
      }
    };
    `;
    return checkValidate;
  }, [listNormalVar, printTableArrErrsVar, tableArrErrsArray]);

  return (
    <div className="App">
      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
        <Col span={8}>
          <div className="label">Danh sách biến thường</div>
          <CodeEditor
            value={listNormalVar.join(",\n")}
            language="js"
            placeholder="Please enter JS code."
            onChange={handleChangeNormalField}
            padding={15}
            style={{
              fontSize: 12,
              backgroundColor: "#061727",
              height: 500,
              overflow: "auto",
              fontFamily:
                "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
            }}
          />
        </Col>
        <Col span={8}>
          <div className="label">Danh sách biến bảng</div>
          <CodeEditor
            language="js"
            placeholder="Please enter JS code."
            value={listTableVar.join(",\n")}
            onChange={handleChangeTableField}
            padding={15}
            style={{
              fontSize: 12,
              backgroundColor: "#061727",
              height: 500,
              overflow: "auto",
              fontFamily:
                "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
            }}
          />
        </Col>
        <Col span={8}>
          <div className="label">Prefix</div>
          <Input
            placeholder="Nhập prefix, ví dụ: pC"
            onChange={handleChangePrefixField}
            value={prefix}
          />
        </Col>
      </Row>
      <div style={{ height: 20 }}></div>
      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
        <Col span={8}>
          <div className="label">Khai báo arrRef</div>
          <CodeEditor
            value={printDeclare()}
            language="js"
            placeholder="Please enter JS code."
            readOnly
            padding={15}
            style={{
              fontSize: 12,
              backgroundColor: "#061727",
              height: 500,
              overflow: "auto",
              fontFamily:
                "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
            }}
          />
        </Col>
        <Col span={8}>
          <div className="label">Biến arrRef</div>
          <CodeEditor
            value={printArrRef()}
            language="js"
            placeholder="Please enter JS code."
            readOnly
            padding={15}
            style={{
              fontSize: 12,
              backgroundColor: "#061727",
              height: 500,

              overflow: "auto",
              fontFamily:
                "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
            }}
          />
        </Col>
        <Col span={8}>
          <div className="label">Hàm CheckValidate</div>
          <CodeEditor
            value={printCheckValidate()}
            language="js"
            placeholder="Please enter JS code."
            readOnly
            padding={15}
            style={{
              fontSize: 12,
              backgroundColor: "#061727",
              height: 500,
              overflow: "auto",
              fontFamily:
                "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
            }}
          />
        </Col>
        <Col span={8}>
          <div className="label">tabIndex</div>
          <CodeEditor
            value={printTabIndexJSX()}
            language="js"
            placeholder="Please enter JS code."
            readOnly
            padding={15}
            style={{
              fontSize: 12,
              backgroundColor: "#061727",
              height: 500,
              overflow: "auto",
              fontFamily:
                "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
            }}
          />
        </Col>
        {listTableVar?.length > 0 ? (
          <Col span={8}>
            <div className="label">Table error</div>
            <CodeEditor
              value={printTableGeneralErrs()}
              language="js"
              placeholder="Please enter JS code."
              readOnly
              padding={15}
              style={{
                fontSize: 12,
                backgroundColor: "#061727",
                height: 500,
                overflow: "auto",
                fontFamily:
                  "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
              }}
            />
          </Col>
        ) : (
          <></>
        )}
      </Row>
    </div>
  );
}

export default App;

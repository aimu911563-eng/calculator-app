const display = document.querySelector("#display");
const buttons = document.querySelectorAll("button");
const history = document.querySelector("#history");

buttons.forEach (button => {
    button.addEventListener ("click", () => {
        const value = button.textContent.trim();

        if (value === "±") {
            toggleSign();
        } else if (value === "%") {
            applyPercent();
        } else if (value === "C") {
            display.value = ""
        } else if (value === "⌫") {
            display.value = display.value.slice(0, -1);
        } else if (value === "=") {
            const expr = display.value
            const result = calculate(expr);

            display.value = String(result);
            history.textContent = `${expr} = ${result}`;
            
        } else if (value === "√") {
            const x = Number(display.value)
            display.value = Math.sqrt(x)
        } else if (value === "x²") {
            const y = Number(display.value)
            display.value = Math.pow(y, 2) 
        } else if (value === "1/x") {
            const z = Number(display.value)

            if (z === 0) {
                display.value = "Error";
                return;
            }
            display.value = parseFloat((1/z).toFixed(10));
            
        } else {
            if (canAppend(value)) display.value +=value;
        };

         
    });
});

    document.addEventListener("keydown", (e) => {
        const keydown = e.key;
        
        if (k === "%") {
            applyPercent();
        } else if ((k >= "0" && k <= "9") || ["+","-","*","/","."].includes(k)) {
            if(canAppend(k)) display.value += k;
        } else if (keydown === "Enter") {
            display.value = String(calculate(display.value));
        } else if (keydown === "Backspace") {
            display.value = display.value.slice(0, -1);
        } else if (keydown === "Escape") {
            display.value = ""
        }
    });

function calculate(expression) {

  const s = String(expression).trim().replace(/\s+/g, "");

  if (!/^-?\d+(\.\d+)?([+\-*/]-?\d+(\.\d+)?)*$/.test(s)) {
    return "Error";
  }

  const tokens = s.match(/(?<=^|[+\-*/])-\d+(?:\.\d+)?|\d+(?:\.\d+)?|[+\-*/]/g);
  if (!tokens) return "Error";

  const vals = [Number(tokens[0])];
  const ops  = []; 
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i];
    const n  = Number(tokens[i + 1]);

    if (op === "*") {
      vals[vals.length - 1] *= n;
    } else if (op === "/") {
      if (n === 0) return "Error";
      vals[vals.length - 1] /= n;
    } else if (op === "+" || op === "-") {
      ops.push(op);
      vals.push(n);
    } else {
      return "Error";
    }
  }

  let result = vals[0];
  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    const n  = vals[i + 1];
    if (op === "+") {
        result += n;
    } else if (op === "-") {
        result -= n;
    } else {
        return "Error";
    }
  }
  
  if (typeof result === "number") {
    return parseFloat(result.toFixed(10));
  }
  
  return result;
}

function canAppend(next) {
    const s = display.value

    if (/[+\-*/]$/.test(s) && /[+\-*/]/.test(next))
        return false

    if(next === ".") {
        const lastNum = s.split(/[+\-*/]/).pop() || "";
        if(lastNum.includes(".")) return false;
        if(lastNum === "") {
            return false;
        }
    }
    return true;
}

document.addEventListener("keydown", (e) => {
    const k = e.key;

    if ((k >= "0" && k <= "9") || ["+","-","*","/","."].includes(k)) {
        if (canAppend(k)) {
            display.value = String(calculate(display.value));
        } else if (k === "Backspace") {
            display.value = display.value.slice(0, -1);
        } else if (k === "Escape") {
            display.value = "";
        }
    }
})

function getLastNumberRange(s) {
    const m = s.match(/(-?\d+(?:\.\d+)?)$/);
    if(!m) {
        return null;
    }
    const end = s.length;
    const start = end - m[0].length;
    return {
        start, end, text: m[0]
    };
}

function toggleSign() {
    const s = display.value
    const r = getLastNumberRange(s);
    if (!r) {
        return
    };

    const n = -Number(r.text);
    const next = s.slice(0, r.start) + String(n) + s.slice(r.end);
    display.value = next;
}

function applyPercent() {
    const s = display.value;
    const r = getLastNumberRange(s);
    if (!r) {
        return
    };

    const n = Number(r.text) / 100;
    const rounded = parseFloat(n.toFixed(10));
    const next = s.slice(0, r.start) + String(rounded + s.slice(r.end));
    display.value = next;
}

//if (canAppend(value)) display.value +=value;

document.querySelector(`.calculator`).addEventListener(`click`, () => display.focus())

const calc = calculate

function assertEqual(actual, expected, label) {
    const ok = (typeof actual === "number" && typeof expected === "number")
    ? Math.abs(actual - expected) < 1e-10
    : Object.is(actual, expected);

    if (!ok) {
        console.error(`✗ ${label}\n expected: ${expected}\n actual : ${actual}`);
        return false;
    }
    console.log(`✓ ${label}`);
    return true;
}

function run(tests) {
    let pass = 0;
    for (const t of tests) {
        try {
            const got = calc(t.input);
            if (assertEqual(got, t.expect, t.label)) pass++;
        } catch (e) {
            console.error(`✗ ${t.label}\n threw: ${e}`);
        }
    }
    console.log(`\nResult: ${pass}/${tests.length} passed`);
}

const mustPass = [
    { label:"1) 足し算", input: "1+2", expect: 3 },
    { label:"2) 引き算", input: "10-3", expect: 7 },
    { label:"3) 掛け算", input: "4*3", expect: 12},
    { label:"4) 割り算", input: "8/2", expect: 4 },
    { label:"5) 連続 + -", input: "10-3+2", expect: 9},
    { label:"6) 優先順位なしの確認", input: "2+3*4", expect: 14 },
    { label:"7) /と*の組み合わせ", input: "20/5*2", expect: 8 },
    { label:"8) 空白の無視", input: " 6 + 7 ", expect: 13 },
    { label:"9) 0除算(単体)", input: "7/0", expect: "Error"},
    { label:"10) 0除算(途中)", input: "10-3/0+2", expect: "Error"},
    { label:"11) 前後空白のみ", input: " 9-4", expect: 5 },
    { label:"12) 複数桁の数値", input: "123+456", expect: 579 },
    { label:"13) 想定外(連続演算子)", input: "2++3", expect: "Error" },
    { label:"14) 想定外(末尾演算子)", input: "5+3-", expect: "Error" },
    { label:"15) 想定外(先頭演算子)", input: "+5+3", expect: "Error" },
    { label:"16) 想定外(文字混入)", input: "2+a", expect: "Error" },
    { label:"17) 0ではない分母", input: "0/5", expect: 0 },
    { label:"18) 0の掛け算", input: "0*99", expect: 0 },
    { label:"19) 先頭ゼロ", input: "001+2", expect: 3 },
    { label:"20) 大きめの数", input: "100000*3", expect: 300000 },
    { label:"P1) 優先順位あり(混在)", input: "10-6/2+3", expect: 10 },
    { label:"D1) 小数の足し算", input: "1.5+2.3", expect: 3.8 },
    { label:"D2) 少数の掛け算", input: "0.1*0.2", expect: 0.02 },
    { label:"D3) 少数を含む優先順位",input: "2+1.5*2", expect: 5 },
];

run(mustPass);
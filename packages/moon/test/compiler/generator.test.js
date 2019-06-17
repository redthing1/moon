import { lex } from "../../src/compiler/lexer/lexer";
import { parse } from "../../src/compiler/parser/parser";
import { generate } from "../../src/compiler/generator/generator";

function assertGenerate(input, output) {
	expect(generate(parse(lex(input)))).toEqual(output);
}

test("generate static element", () => {
	assertGenerate(
		"<div><h1>Test</h1><p>test</p></div>",
		"if(ms[0]===undefined){ms[0]=m(0,\"div\",{},[m(0,\"h1\",{},[m(1,\"text\",{\"\":\"Test\"},[])]),m(0,\"p\",{},[m(1,\"text\",{\"\":\"test\"},[])])]);}return ms[0];"
	);
});

test("generate dynamic element", () => {
	assertGenerate(
		"<div><h1>Test</h1><p>test {message}</p></div>",
		"if(ms[0]===undefined){ms[0]=[];ms[1]=m(1,\"text\",{\"\":\"test \"},[]);ms[2]={};ms[3]=m(0,\"h1\",{},[m(1,\"text\",{\"\":\"Test\"},[])]);}return m(0,\"div\",ms[2],[ms[3],m(0,\"p\",ms[2],[ms[1],m(1,\"text\",{\"\":md.message},ms[0])])]);"
	);
});

test("generate static attributes", () => {
	assertGenerate(
		"<div><h1 id='bar' class='foo'>Test</h1><p>test {message}</p></div>",
		"if(ms[0]===undefined){ms[0]=[];ms[1]=m(1,\"text\",{\"\":\"test \"},[]);ms[2]={};ms[3]=m(0,\"h1\",{\"id\":'bar',\"className\":'foo'},[m(1,\"text\",{\"\":\"Test\"},[])]);}return m(0,\"div\",ms[2],[ms[3],m(0,\"p\",ms[2],[ms[1],m(1,\"text\",{\"\":md.message},ms[0])])]);"
	);
});

test("generate dynamic attributes", () => {
	assertGenerate(
		"<div><h1 id='bar' class={foo}>Test</h1><p>test {message}</p></div>",
		"if(ms[0]===undefined){ms[0]=[m(1,\"text\",{\"\":\"Test\"},[])];ms[1]=[];ms[2]=m(1,\"text\",{\"\":\"test \"},[]);ms[3]={};}return m(0,\"div\",ms[3],[m(0,\"h1\",{\"id\":'bar',\"className\":md.foo},ms[0]),m(0,\"p\",ms[3],[ms[2],m(1,\"text\",{\"\":md.message},ms[1])])]);"
	);
});

test("generate static children attribute", () => {
	assertGenerate(
		"<div foo={bar} children={[]}></div>",
		"if(ms[0]===undefined){ms[0]=[];}return m(0,\"div\",{\"foo\":md.bar},ms[0]);"
	);
});

test("generate dynamic children attribute", () => {
	assertGenerate(
		"<div children={children}></div>",
		"if(ms[0]===undefined){ms[0]={};}return m(0,\"div\",ms[0],mc);"
	);
});

test("generate events", () => {
	assertGenerate(
		"<div><h1 id='bar' class={foo} @click={doSomething}>Test</h1><p>test {message}</p></div>",
		"if(ms[0]===undefined){ms[0]=[m(1,\"text\",{\"\":\"Test\"},[])];ms[1]=[];ms[2]=m(1,\"text\",{\"\":\"test \"},[]);ms[3]={};}return m(0,\"div\",ms[3],[m(0,\"h1\",{\"id\":'bar',\"className\":md.foo,\"@click\":[md.doSomething,md,mc]},ms[0]),m(0,\"p\",ms[3],[ms[2],m(1,\"text\",{\"\":md.message},ms[1])])]);"
	);
});

test("generate static components", () => {
	assertGenerate(
		"<div><Component/></div>",
		"if(ms[0]===undefined){ms[0]=m(0,\"div\",{},[m(2,\"Component\",{},[])]);}return ms[0];"
	);
});

test("generate static components with data", () => {
	assertGenerate(
		"<div><Component foo='bar' bar='baz'/></div>",
		"if(ms[0]===undefined){ms[0]=m(0,\"div\",{},[m(2,\"Component\",{\"foo\":'bar',\"bar\":'baz'},[])]);}return ms[0];"
	);
});

test("generate static components with children", () => {
	assertGenerate(
		"<div><Component foo='bar' bar='baz'><p>static</p></Component></div>",
		"if(ms[0]===undefined){ms[0]=m(0,\"div\",{},[m(2,\"Component\",{\"foo\":'bar',\"bar\":'baz'},[m(0,\"p\",{},[m(1,\"text\",{\"\":\"static\"},[])])])]);}return ms[0];"
	);
});

test("generate dynamic components with data", () => {
	assertGenerate(
		"<div><Component foo={bar} bar='baz'/></div>",
		"if(ms[0]===undefined){ms[0]=[];ms[1]={};}return m(0,\"div\",ms[1],[m(2,\"Component\",{\"foo\":md.bar,\"bar\":'baz'},ms[0])]);"
	);
});

test("generate dynamic components with children", () => {
	assertGenerate(
		"<div><Component foo={bar} bar='baz'><p>{message}</p></Component></div>",
		"if(ms[0]===undefined){ms[0]=[];ms[1]={};}return m(0,\"div\",ms[1],[m(2,\"Component\",{\"foo\":md.bar,\"bar\":'baz'},[m(0,\"p\",ms[1],[m(1,\"text\",{\"\":md.message},ms[0])])])]);"
	);
});

test("generate text directly", () => {
	assertGenerate(
		"<text={foo}/>",
		"if(ms[0]===undefined){ms[0]=[];}return m(1,\"text\",{\"\":md.foo},ms[0]);"
	);
});

test("generate static element nodes", () => {
	assertGenerate(
		"<element name='h1' data={{static: true}} children={[]}/>",
		"if(ms[0]===undefined){ms[0]=m(0,'h1',{static: true},[]);}return ms[0];"
	);
});

test("generate static data element nodes", () => {
	assertGenerate(
		"<element name='h1' data={{static: true}} children={dynamic}/>",
		"if(ms[0]===undefined){ms[0]={static: true};}return m(0,'h1',ms[0],md.dynamic);"
	);
});

test("generate static children element nodes", () => {
	assertGenerate(
		"<element name='h1' data={{dynamic: dynamic}} children={[]}/>",
		"if(ms[0]===undefined){ms[0]=[];}return m(0,'h1',{dynamic: md.dynamic},ms[0]);"
	);
});

test("generate dynamic element nodes", () => {
	assertGenerate(
		"<element name='h1' data={dynamic} children={dynamicChildren}/>",
		"if(ms[0]===undefined){}return m(0,'h1',md.dynamic,md.dynamicChildren);"
	);
});

test("generate if node", () => {
	assertGenerate(
		"<div><if={condition}><p>test</p></if></div>",
		"if(ms[0]===undefined){ms[0]=m(0,\"p\",{},[m(1,\"text\",{\"\":\"test\"},[])]);ms[1]=m(1,\"text\",{\"\":\"\"},[]);ms[2]={};}var m0;if(md.condition){m0=ms[0];}else{m0=ms[1];}return m(0,\"div\",ms[2],[m0]);"
	);
});

test("generate if node at root", () => {
	assertGenerate(
		"<if={condition}><p>test</p></if>",
		"if(ms[0]===undefined){ms[0]=m(0,\"p\",{},[m(1,\"text\",{\"\":\"test\"},[])]);ms[1]=m(1,\"text\",{\"\":\"\"},[]);}var m0;if(md.condition){m0=ms[0];}else{m0=ms[1];}return m0;"
	);
});

test("generate if/else node", () => {
	assertGenerate(
		"<div><if={condition}><p>test</p></if><else>{dynamic}</else></div>",
		"if(ms[0]===undefined){ms[0]=m(0,\"p\",{},[m(1,\"text\",{\"\":\"test\"},[])]);ms[1]=[];ms[2]={};}var m0;if(md.condition){m0=ms[0];}else{m0=m(1,\"text\",{\"\":md.dynamic},ms[1]);}return m(0,\"div\",ms[2],[m0]);"
	);
});

test("generate if/else-if node", () => {
	assertGenerate(
		"<div><if={condition}><p>test</p></if><else-if={condition2}><h3>Dynamic: {dynamic}</h3></else-if></div>",
		"if(ms[0]===undefined){ms[0]=m(0,\"p\",{},[m(1,\"text\",{\"\":\"test\"},[])]);ms[1]=[];ms[2]=m(1,\"text\",{\"\":\"Dynamic: \"},[]);ms[3]={};ms[4]=m(1,\"text\",{\"\":\"\"},[]);}var m0;if(md.condition){m0=ms[0];}else if(md.condition2){m0=m(0,\"h3\",ms[3],[ms[2],m(1,\"text\",{\"\":md.dynamic},ms[1])]);}else{m0=ms[4];}return m(0,\"div\",ms[3],[m0]);"
	);
});

test("generate if/else-if/else node", () => {
	assertGenerate(
		"<div><if={condition}><p>test</p></if><else-if={condition2}><h3>Dynamic: {dynamic}</h3></else-if><else>{dynamic}</else><h5>Ending</h5></div>",
		"if(ms[0]===undefined){ms[0]=m(0,\"p\",{},[m(1,\"text\",{\"\":\"test\"},[])]);ms[1]=[];ms[2]=m(1,\"text\",{\"\":\"Dynamic: \"},[]);ms[3]={};ms[4]=m(0,\"h5\",{},[m(1,\"text\",{\"\":\"Ending\"},[])]);}var m0;if(md.condition){m0=ms[0];}else if(md.condition2){m0=m(0,\"h3\",ms[3],[ms[2],m(1,\"text\",{\"\":md.dynamic},ms[1])]);}else{m0=m(1,\"text\",{\"\":md.dynamic},ms[1]);}return m(0,\"div\",ms[3],[m0,ms[4]]);"
	);
});

test("generate nested if/else-if/else node", () => {
	assertGenerate(
		"<div><if={condition}><p><if={condition}><if={nested}><p>test</p></if></if><else-if={condition2}><h3>Dynamic: {dynamic}</h3></else-if><else>{dynamic}</else></p></if><else-if={condition2}><h3>Dynamic: {dynamic} <if={condition}><p>test</p></if><else-if={condition2}><h3>Dynamic: {dynamic}</h3></else-if><else>{dynamic}</else></h3></else-if><else>{dynamic} <if={condition}><p>test</p></if><else-if={condition2}><h3>Dynamic: {dynamic}</h3></else-if><else>{dynamic}</else></else></div>",
		"if(ms[0]===undefined){ms[0]=m(0,\"p\",{},[m(1,\"text\",{\"\":\"test\"},[])]);ms[1]=m(1,\"text\",{\"\":\"\"},[]);ms[2]=[];ms[3]=m(1,\"text\",{\"\":\"Dynamic: \"},[]);ms[4]={};}var m0;if(md.condition){var m1;if(md.condition){var m2;if(md.nested){m2=ms[0];}else{m2=ms[1];}m1=m2;}else if(md.condition2){m1=m(0,\"h3\",ms[4],[ms[3],m(1,\"text\",{\"\":md.dynamic},ms[2])]);}else{m1=m(1,\"text\",{\"\":md.dynamic},ms[2]);}m0=m(0,\"p\",ms[4],[m1]);}else if(md.condition2){var m3;if(md.condition){m3=ms[0];}else if(md.condition2){m3=m(0,\"h3\",ms[4],[ms[3],m(1,\"text\",{\"\":md.dynamic},ms[2])]);}else{m3=m(1,\"text\",{\"\":md.dynamic},ms[2]);}m0=m(0,\"h3\",ms[4],[ms[3],m(1,\"text\",{\"\":md.dynamic},ms[2]),m3]);}else{m0=m(1,\"text\",{\"\":md.dynamic},ms[2]);}return m(0,\"div\",ms[4],[m0]);"
	);
});

test("generate static for-of node", () => {
	assertGenerate(
		"<for={$item} of={list}><p>test</p></for>",
		"if(ms[0]===undefined){ms[0]=m(0,\"p\",{},[m(1,\"text\",{\"\":\"test\"},[])]);ms[1]={};}var m0=[];for(var m1=0;m1<md.list.length;m1++){var $item=md.list[m1];m0.push(ms[0]);}return m(0,\"span\",ms[1],m0);"
	);
});

test("generate for-of node", () => {
	assertGenerate(
		"<for={$item} of={list}><p>{$item}</p></for>",
		"if(ms[0]===undefined){ms[0]=[];ms[1]={};}var m0=[];for(var m1=0;m1<md.list.length;m1++){var $item=md.list[m1];m0.push(m(0,\"p\",ms[1],[m(1,\"text\",{\"\":$item},ms[0])]));}return m(0,\"span\",ms[1],m0);"
	);
});

test("generate for-of node with index", () => {
	assertGenerate(
		"<for={$item,$index} of={list}><p>{$item} {$index}</p></for>",
		"if(ms[0]===undefined){ms[0]=[];ms[1]={};}var m0=[];for(var $index=0;$index<md.list.length;$index++){var $item=md.list[$index];m0.push(m(0,\"p\",ms[1],[m(1,\"text\",{\"\":$item},ms[0]),m(1,\"text\",{\"\":$index},ms[0])]));}return m(0,\"span\",ms[1],m0);"
	);
});

test("generate static for-in node", () => {
	assertGenerate(
		"<for={$key} in={obj}><p>test</p></for>",
		"if(ms[0]===undefined){ms[0]=m(0,\"p\",{},[m(1,\"text\",{\"\":\"test\"},[])]);ms[1]={};}var m0=[];for(var $key in md.obj){m0.push(ms[0]);}return m(0,\"span\",ms[1],m0);"
	);
});

test("generate for-in node", () => {
	assertGenerate(
		"<for={$key} in={obj}><p>{$key}</p></for>",
		"if(ms[0]===undefined){ms[0]=[];ms[1]={};}var m0=[];for(var $key in md.obj){m0.push(m(0,\"p\",ms[1],[m(1,\"text\",{\"\":$key},ms[0])]));}return m(0,\"span\",ms[1],m0);"
	);
});

test("generate for-in node with value", () => {
	assertGenerate(
		"<for={$key,$value} in={obj}><p>{$key} {$value}</p></for>",
		"if(ms[0]===undefined){ms[0]=[];ms[1]={};}var m0=[];for(var $key in md.obj){var $value=md.obj[$key];m0.push(m(0,\"p\",ms[1],[m(1,\"text\",{\"\":$key},ms[0]),m(1,\"text\",{\"\":$value},ms[0])]));}return m(0,\"span\",ms[1],m0);"
	);
});

test("generate nested for nodes", () => {
	assertGenerate(
		"<for={$item,$index} of={list}><for={$key,$value} in={$item}><p>{$item} {$index} {$key} {$value}</p></for></for>",
		"if(ms[0]===undefined){ms[0]=[];ms[1]={};}var m0=[];for(var $index=0;$index<md.list.length;$index++){var $item=md.list[$index];var m1=[];for(var $key in $item){var $value=$item[$key];m1.push(m(0,\"p\",ms[1],[m(1,\"text\",{\"\":$item},ms[0]),m(1,\"text\",{\"\":$index},ms[0]),m(1,\"text\",{\"\":$key},ms[0]),m(1,\"text\",{\"\":$value},ms[0])]));}m0.push(m(0,\"span\",ms[1],m1));}return m(0,\"span\",ms[1],m0);"
	);
});

test("generate for node with static custom element", () => {
	assertGenerate(
		"<for={$item,$index} of={list} name='h1' data={{ custom: true }}><p>{$item} {$index}</p></for>",
		"if(ms[0]===undefined){ms[0]=[];ms[1]={};ms[2]={ custom: true };}var m0=[];for(var $index=0;$index<md.list.length;$index++){var $item=md.list[$index];m0.push(m(0,\"p\",ms[1],[m(1,\"text\",{\"\":$item},ms[0]),m(1,\"text\",{\"\":$index},ms[0])]));}return m(0,'h1',ms[2],m0);"
	);
});

test("generate for node with dynamic custom element", () => {
	assertGenerate(
		"<for={$item,$index} of={list} name='h1' data={{ custom: dynamic }}><p>{$item} {$index}</p></for>",
		"if(ms[0]===undefined){ms[0]=[];ms[1]={};}var m0=[];for(var $index=0;$index<md.list.length;$index++){var $item=md.list[$index];m0.push(m(0,\"p\",ms[1],[m(1,\"text\",{\"\":$item},ms[0]),m(1,\"text\",{\"\":$index},ms[0])]));}return m(0,'h1',{ custom: md.dynamic },m0);"
	);
});
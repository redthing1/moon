import { lex, tokenString } from "../../src/compiler/lexer/lexer";

test("lex opening tag", () => {
	expect(lex(`<div>`)).toEqual([{"attributes": {}, "closed": false, "type": "tagOpen", "value": "div"}]);
});

test("lex closing tag", () => {
	expect(lex(`</div>`)).toEqual([{"type": "tagClose", "value": "div"}]);
});

test("lex self closing tag", () => {
	expect(lex(`<input/>`)).toEqual([{"attributes": {}, "closed": true, "type": "tagOpen", "value": "input"}]);
});

test("lex text", () => {
	expect(lex(`text test`)).toEqual([{"attributes": {"": {"value": "\"text test\"", "isExpression": false}}, "closed": true, "type": "tagOpen", "value": "text"}]);
});

test("lex text inside tag", () => {
	expect(lex(`<div>text</div>`)).toEqual([
		{
			"type": "tagOpen",
			"value": "div",
			"attributes": {},
			"closed": false
		},
		{
			"type": "tagOpen",
			"value": "text",
			"attributes": {
				"": {
					"value": "\"text\"",
					"isExpression": false
				}
			},
			"closed": true
		},
		{
			"type": "tagClose",
			"value": "div"
		}
	]);
})

test("lex expression", () => {
	expect(lex(`{data + 1 + {foo: true, bar: false}}`)).toEqual([{"attributes": {"": {"value": "data + 1 + {foo: true, bar: false}", "isExpression": true}}, "closed": true, "type": "tagOpen", "value": "text"}]);
});

test("lex attributes", () => {
	expect(lex(`<div id="test-id" class='test-class' for='input' dynamic={true} local={$local} fn={() => true} nested={{foo: {bar: true}, baz: false}} self>`)).toEqual([{"attributes": {"id": {"value": "\"test-id\"", "isExpression": false}, "className": {"value": "'test-class'", "isExpression": false}, "htmlFor": {"value": "'input'", "isExpression": false}, "dynamic": {"value": "true", "isExpression": true}, "local": {"value": "$local", "isExpression": true}, "fn": {"value": "() => true", "isExpression": true}, "self": {"value": "true", "isExpression": true}, "nested": {"value": "{foo: {bar: true}, baz: false}", "isExpression": true}}, "closed": false, "type": "tagOpen", "value": "div"}]);
});

test("lex `children` data reference", () => {
	expect(lex(`<div data={children}></div>`)).toEqual([{"attributes": {"data": {"isExpression": true, "value": "children"}}, "closed": false, "type": "tagOpen", "value": "div"}, {"type": "tagClose", "value": "div"}]);
});

test("lex events", () => {
	expect(lex(`<div id="test-id" class='test-class' dynamic={true} self @event={doSomething}>`)).toEqual([{"attributes": {"id": {"value": "\"test-id\"", "isExpression": false}, "className": {"value": "'test-class'", "isExpression": false}, "dynamic": {"value": "true", "isExpression": true}, "@event": {"value": "doSomething", "isExpression": true}, "self": {"value": "true", "isExpression": true}}, "closed": false, "type": "tagOpen", "value": "div"}]);
});

test("lex comments", () => {
	expect(lex(`<!-- comment -->`)).toEqual([]);
});

test("opening tag token to string", () => {
	const input = "<div>";
	expect(tokenString(lex(input)[0])).toBe(input);
});

test("opening tag token with attributes to string", () => {
	const input = `<div id="test-id" className='test-class' expression={dynamic}>`;
	expect(tokenString(lex(input)[0])).toBe(input.replace("dynamic", "dynamic"));
});

test("self-closing tag token to string", () => {
	const input = `<input/>`;
	expect(tokenString(lex(input)[0])).toBe(input);
});

test("self-closing tag token with attributes to string", () => {
	const input = `<input id="test-id" className='test-class' expression={dynamic}/>`;
	expect(tokenString(lex(input)[0])).toBe(input.replace("dynamic", "dynamic"));
});

test("closing tag token to string", () => {
	const input = `</div>`;
	expect(tokenString(lex(input)[0])).toBe(input);
});

test("text token to string", () => {
	const input = `Test Text`;
	expect(tokenString(lex(input)[0])).toBe(input);
});

test("expression token to string", () => {
	const input = `{dynamic + 1}`;
	expect(tokenString(lex(input)[0])).toBe(input.replace("dynamic", "dynamic"));
});

test("lex error from unclosed opening bracket", () => {
	console.error = jest.fn();

	expect(Array.isArray(lex("<div><"))).toBe(true);
	expect(console.error).toBeCalled();
});

test("lex error from unclosed closing tag", () => {
	console.error = jest.fn();

	expect(Array.isArray(lex("</div"))).toBe(true);
	expect(console.error).toBeCalled();
});

test("lex error from unclosed comment", () => {
	console.error = jest.fn();

	expect(Array.isArray(lex("<!-- endless comment"))).toBe(true);
	expect(console.error).toBeCalled();
});

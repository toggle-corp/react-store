import {
    requiredCondition,
    numberCondition,
    integerCondition,
    lessThanCondition,
    greaterThanCondition,
    lessThanOrEqualToCondition,
    greaterThanOrEqualToCondition,
    lengthLessThanCondition,
    lengthGreaterThanCondition,
    lengthEqualToCondition,
    emailCondition,
    urlCondition,
} from './validations';

test('required condition', () => {
    expect(requiredCondition('').ok).toBe(false);
    expect(requiredCondition(NaN).ok).toBe(false);
    expect(requiredCondition(undefined).ok).toBe(false);
    expect(requiredCondition(null).ok).toBe(false);
    expect(requiredCondition(1).ok).toBe(true);
    expect(requiredCondition('hari').ok).toBe(true);
    expect(requiredCondition({ some: 'key' }).ok).toBe(true);
});

test('number condition', () => {
    expect(numberCondition(undefined).ok).toBe(true);
    expect(numberCondition(null).ok).toBe(true);
    expect(numberCondition('').ok).toBe(true);

    expect(numberCondition('hari').ok).toBe(false);
    expect(numberCondition('1.23').ok).toBe(true);
    expect(numberCondition(1.23).ok).toBe(true);
    expect(numberCondition(-1).ok).toBe(true);
});

test('integer condition', () => {
    expect(numberCondition(undefined).ok).toBe(true);
    expect(numberCondition(null).ok).toBe(true);
    expect(numberCondition('').ok).toBe(true);

    expect(integerCondition('1.23').ok).toBe(false);
    expect(integerCondition(1.23).ok).toBe(false);
    expect(integerCondition(-1).ok).toBe(true);
    expect(integerCondition('2').ok).toBe(true);
});

test('less than condition', () => {
    expect(lessThanCondition(1)(3).ok).toBe(false);
    expect(lessThanCondition(1)(1).ok).toBe(false);
    expect(lessThanCondition(1)(-1).ok).toBe(true);
});

test('greater than condition', () => {
    expect(greaterThanCondition(1)(3).ok).toBe(true);
    expect(greaterThanCondition(1)(1).ok).toBe(false);
    expect(greaterThanCondition(1)(-1).ok).toBe(false);
});

test('less than or equal condition', () => {
    expect(lessThanOrEqualToCondition(1)(3).ok).toBe(false);
    expect(lessThanOrEqualToCondition(1)(1).ok).toBe(true);
    expect(lessThanOrEqualToCondition(1)(-1).ok).toBe(true);
});

test('greater than or equal condition', () => {
    expect(greaterThanOrEqualToCondition(1)(3).ok).toBe(true);
    expect(greaterThanOrEqualToCondition(1)(1).ok).toBe(true);
    expect(greaterThanOrEqualToCondition(1)(-1).ok).toBe(false);
});

test('length less than condition', () => {
    expect(lengthLessThanCondition(3)('abcde').ok).toBe(false);
    expect(lengthLessThanCondition(3)('abc').ok).toBe(false);
    expect(lengthLessThanCondition(3)('ab').ok).toBe(true);
    expect(lengthLessThanCondition(3)('').ok).toBe(true);
});


test('length greater than condition', () => {
    expect(lengthGreaterThanCondition(3)('abcde').ok).toBe(true);
    expect(lengthGreaterThanCondition(3)('abc').ok).toBe(false);
    expect(lengthGreaterThanCondition(3)('ab').ok).toBe(false);
});

test('length equal to condition', () => {
    expect(lengthEqualToCondition(3)('abc').ok).toBe(true);
    expect(lengthEqualToCondition(3)('def').ok).toBe(true);
    expect(lengthEqualToCondition(3)('ab').ok).toBe(false);
    expect(lengthEqualToCondition(3)('abcde').ok).toBe(false);
});

test('email condition', () => {
    expect(emailCondition('').ok).toBe(true);
    expect(emailCondition('hari@test.com').ok).toBe(true);
    expect(emailCondition('panda').ok).toBe(false);
    expect(emailCondition('panda.com').ok).toBe(false);
    expect(emailCondition('&*^%$#$%^&*&^%$#@.com').ok).toBe(false);
    expect(emailCondition('@eampl.com').ok).toBe(false);
    expect(emailCondition('Joe Smith <email@example.com>').ok).toBe(false);
    expect(emailCondition('email..email@example.com').ok).toBe(false);
    expect(emailCondition('email@example.com (Joe Smith)').ok).toBe(false);
    expect(emailCondition('email@example').ok).toBe(false);
    expect(emailCondition('email@111.222.333.44444').ok).toBe(false);
    expect(emailCondition('email@example..com').ok).toBe(false);
    expect(emailCondition('Abc..123@example.com').ok).toBe(false);
});


test('url condition', () => {
    expect(urlCondition('').ok).toBe(true);
    expect(urlCondition('').ok).toBe(true);

    expect(urlCondition('https://www.w3.org/Protocols/HTTP/1.1/rfc2616.pdf').ok).toBe(true);
    expect(urlCondition('http://www.pdf995.com/samples/pdf.pdf').ok).toBe(true);
    expect(urlCondition('https://raaya_karas.carbonmade.com/').ok).toBe(true);

    expect(urlCondition('http://foo.com/blah_blah').ok).toBe(true);
    expect(urlCondition('http://foo.com/blah_blah/').ok).toBe(true);
    expect(urlCondition('http://foo.com/blah_blah_(wikipedia)').ok).toBe(true);
    expect(urlCondition('http://foo.com/blah_blah_(wikipedia)_(again)').ok).toBe(true);
    expect(urlCondition('http://www.example.com/wpstyle/?p=364').ok).toBe(true);
    expect(urlCondition('https://www.example.com/foo/?bar=baz&inga=42&quux').ok).toBe(true);
    expect(urlCondition('http://142.42.1.1/').ok).toBe(true);
    expect(urlCondition('http://142.42.1.1:8080/').ok).toBe(true);
    expect(urlCondition('http://foo.com/blah_(wikipedia)#cite-1').ok).toBe(true);
    expect(urlCondition('http://foo.com/blah_(wikipedia)_blah#cite-1').ok).toBe(true);
    expect(urlCondition('http://foo.com/(something)?after=parens').ok).toBe(true);
    expect(urlCondition('http://code.google.com/events/#&product=browser').ok).toBe(true);
    expect(urlCondition('http://j.mp').ok).toBe(true);
    expect(urlCondition('http://foo.bar/?q=Test%20URL-encoded%20stuff').ok).toBe(true);
    expect(urlCondition('http://1337.net').ok).toBe(true);
    expect(urlCondition('http://a.b-c.de').ok).toBe(true);
    expect(urlCondition('http://223.255.255.254').ok).toBe(true);

    expect(urlCondition('http://userid:password@example.com:8080').ok).toBe(true);
    expect(urlCondition('http://userid:password@example.com:8080/').ok).toBe(true);
    expect(urlCondition('http://userid@example.com').ok).toBe(true);
    expect(urlCondition('http://userid@example.com/').ok).toBe(true);
    expect(urlCondition('http://userid@example.com:8080').ok).toBe(true);
    expect(urlCondition('http://userid@example.com:8080/').ok).toBe(true);
    expect(urlCondition('http://userid:password@example.com').ok).toBe(true);
    expect(urlCondition('http://userid:password@example.com/').ok).toBe(true);
    expect(urlCondition('ftp://foo.bar/baz').ok).toBe(true);

    expect(urlCondition('http://').ok).toBe(false);
    expect(urlCondition('http://.').ok).toBe(false);
    expect(urlCondition('http://..').ok).toBe(false);
    expect(urlCondition('http://../').ok).toBe(false);
    expect(urlCondition('http://?').ok).toBe(false);
    expect(urlCondition('http://??').ok).toBe(false);
    expect(urlCondition('http://??/').ok).toBe(false);
    expect(urlCondition('http://#').ok).toBe(false);
    expect(urlCondition('http://##').ok).toBe(false);
    expect(urlCondition('http://##/').ok).toBe(false);
    expect(urlCondition('//').ok).toBe(false);
    expect(urlCondition('//a').ok).toBe(false);
    expect(urlCondition('///a').ok).toBe(false);
    expect(urlCondition('///').ok).toBe(false);
    expect(urlCondition('http:///a').ok).toBe(false);
    expect(urlCondition('foo.com').ok).toBe(false);
    expect(urlCondition('rdar://1234').ok).toBe(false);
    expect(urlCondition('h://test').ok).toBe(false);
    expect(urlCondition('http:// shouldfail.com').ok).toBe(false);
    expect(urlCondition('://shouldfail').ok).toBe(false);
    expect(urlCondition('ftps://foo.bar/').ok).toBe(false);
    expect(urlCondition('http://-error-.invalid/').ok).toBe(false);
    expect(urlCondition('http://-a.b.co').ok).toBe(false);
    expect(urlCondition('http://3628126748').ok).toBe(false);
    expect(urlCondition('http://10.1.1.1').ok).toBe(false);
    expect(urlCondition('http://10.1.1.254').ok).toBe(false);
    expect(urlCondition('http://foo.bar?q=Spaces should be encoded').ok).toBe(false);
    // expect(urlCondition('http://foo.bar/foo(bar)bazquux').ok).toBe(false);
    // expect(urlCondition('http://a.b--c.de/').ok).toBe(false);
    expect(urlCondition('http://a.b-.co').ok).toBe(false);
    expect(urlCondition('http://1.1.1.1.1').ok).toBe(false);
    expect(urlCondition('http://123.123.123').ok).toBe(false);
    expect(urlCondition('http://.www.foo.bar/').ok).toBe(false);
    // expect(urlCondition('http://www.foo.bar./').ok).toBe(false);
    expect(urlCondition('http://.www.foo.bar./').ok).toBe(false);
});

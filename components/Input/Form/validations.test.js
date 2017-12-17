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
    expect(requiredCondition.truth('')).toBe(false);
    expect(requiredCondition.truth(NaN)).toBe(false);
    expect(requiredCondition.truth(undefined)).toBe(false);
    expect(requiredCondition.truth(null)).toBe(false);
    expect(requiredCondition.truth(1)).toBe(true);
    expect(requiredCondition.truth('hari')).toBe(true);
    expect(requiredCondition.truth({ some: 'key' })).toBe(true);
});

test('number condition', () => {
    expect(numberCondition.truth(undefined)).toBe(true);
    expect(numberCondition.truth(null)).toBe(true);
    expect(numberCondition.truth('')).toBe(true);

    expect(numberCondition.truth('hari')).toBe(false);
    expect(numberCondition.truth('1.23')).toBe(true);
    expect(numberCondition.truth(1.23)).toBe(true);
    expect(numberCondition.truth(-1)).toBe(true);
});

test('integer condition', () => {
    expect(numberCondition.truth(undefined)).toBe(true);
    expect(numberCondition.truth(null)).toBe(true);
    expect(numberCondition.truth('')).toBe(true);

    expect(integerCondition.truth('1.23')).toBe(false);
    expect(integerCondition.truth(1.23)).toBe(false);
    expect(integerCondition.truth(-1)).toBe(true);
    expect(integerCondition.truth('2')).toBe(true);
});

test('less than condition', () => {
    expect(lessThanCondition(1).truth(3)).toBe(false);
    expect(lessThanCondition(1).truth(1)).toBe(false);
    expect(lessThanCondition(1).truth(-1)).toBe(true);
});

test('greater than condition', () => {
    expect(greaterThanCondition(1).truth(3)).toBe(true);
    expect(greaterThanCondition(1).truth(1)).toBe(false);
    expect(greaterThanCondition(1).truth(-1)).toBe(false);
});

test('less than or equal condition', () => {
    expect(lessThanOrEqualToCondition(1).truth(3)).toBe(false);
    expect(lessThanOrEqualToCondition(1).truth(1)).toBe(true);
    expect(lessThanOrEqualToCondition(1).truth(-1)).toBe(true);
});

test('greater than or equal condition', () => {
    expect(greaterThanOrEqualToCondition(1).truth(3)).toBe(true);
    expect(greaterThanOrEqualToCondition(1).truth(1)).toBe(true);
    expect(greaterThanOrEqualToCondition(1).truth(-1)).toBe(false);
});

test('length less than condition', () => {
    expect(lengthLessThanCondition(3).truth('abcde')).toBe(false);
    expect(lengthLessThanCondition(3).truth('abc')).toBe(false);
    expect(lengthLessThanCondition(3).truth('ab')).toBe(true);
    expect(lengthLessThanCondition(3).truth('')).toBe(true);
});


test('length greater than condition', () => {
    expect(lengthGreaterThanCondition(3).truth('abcde')).toBe(true);
    expect(lengthGreaterThanCondition(3).truth('abc')).toBe(false);
    expect(lengthGreaterThanCondition(3).truth('ab')).toBe(false);
});

test('length equal to condition', () => {
    expect(lengthEqualToCondition(3).truth('abc')).toBe(true);
    expect(lengthEqualToCondition(3).truth('def')).toBe(true);
    expect(lengthEqualToCondition(3).truth('ab')).toBe(false);
    expect(lengthEqualToCondition(3).truth('abcde')).toBe(false);
});

test('email condition', () => {
    expect(emailCondition.truth('')).toBe(true);
    expect(emailCondition.truth('hari@test.com')).toBe(true);
    expect(emailCondition.truth('panda')).toBe(false);
    expect(emailCondition.truth('panda.com')).toBe(false);
    expect(emailCondition.truth('&*^%$#$%^&*&^%$#@.com')).toBe(false);
    expect(emailCondition.truth('@eampl.com')).toBe(false);
    expect(emailCondition.truth('Joe Smith <email@example.com>')).toBe(false);
    expect(emailCondition.truth('email..email@example.com')).toBe(false);
    expect(emailCondition.truth('email@example.com (Joe Smith)')).toBe(false);
    expect(emailCondition.truth('email@example')).toBe(false);
    expect(emailCondition.truth('email@111.222.333.44444')).toBe(false);
    expect(emailCondition.truth('email@example..com')).toBe(false);
    expect(emailCondition.truth('Abc..123@example.com')).toBe(false);
});


test('url condition', () => {
    expect(urlCondition.truth('')).toBe(true);
    expect(urlCondition.truth('')).toBe(true);
    expect(urlCondition.truth('http://foo.com/blah_blah')).toBe(true);
    expect(urlCondition.truth('http://foo.com/blah_blah/')).toBe(true);
    expect(urlCondition.truth('http://foo.com/blah_blah_(wikipedia)')).toBe(true);
    expect(urlCondition.truth('http://foo.com/blah_blah_(wikipedia)_(again)')).toBe(true);
    expect(urlCondition.truth('http://www.example.com/wpstyle/?p=364')).toBe(true);
    expect(urlCondition.truth('https://www.example.com/foo/?bar=baz&inga=42&quux')).toBe(true);
    expect(urlCondition.truth('http://142.42.1.1/')).toBe(true);
    expect(urlCondition.truth('http://142.42.1.1:8080/')).toBe(true);
    expect(urlCondition.truth('http://foo.com/blah_(wikipedia)#cite-1')).toBe(true);
    expect(urlCondition.truth('http://foo.com/blah_(wikipedia)_blah#cite-1')).toBe(true);
    expect(urlCondition.truth('http://foo.com/(something)?after=parens')).toBe(true);
    expect(urlCondition.truth('http://code.google.com/events/#&product=browser')).toBe(true);
    expect(urlCondition.truth('http://j.mp')).toBe(true);
    expect(urlCondition.truth('http://foo.bar/?q=Test%20URL-encoded%20stuff')).toBe(true);
    expect(urlCondition.truth('http://1337.net')).toBe(true);
    expect(urlCondition.truth('http://a.b-c.de')).toBe(true);
    expect(urlCondition.truth('http://223.255.255.254')).toBe(true);

    /*
    expect(urlCondition.truth('http://userid:password@example.com:8080')).toBe(true);
    expect(urlCondition.truth('http://userid:password@example.com:8080/')).toBe(true);
    expect(urlCondition.truth('http://userid@example.com')).toBe(true);
    expect(urlCondition.truth('http://userid@example.com/')).toBe(true);
    expect(urlCondition.truth('http://userid@example.com:8080')).toBe(true);
    expect(urlCondition.truth('http://userid@example.com:8080/')).toBe(true);
    expect(urlCondition.truth('http://userid:password@example.com')).toBe(true);
    expect(urlCondition.truth('http://userid:password@example.com/')).toBe(true);
    expect(urlCondition.truth('ftp://foo.bar/baz')).toBe(true);
    */

    expect(urlCondition.truth('http://')).toBe(false);
    expect(urlCondition.truth('http://.')).toBe(false);
    expect(urlCondition.truth('http://..')).toBe(false);
    expect(urlCondition.truth('http://../')).toBe(false);
    expect(urlCondition.truth('http://?')).toBe(false);
    expect(urlCondition.truth('http://??')).toBe(false);
    expect(urlCondition.truth('http://??/')).toBe(false);
    expect(urlCondition.truth('http://#')).toBe(false);
    expect(urlCondition.truth('http://##')).toBe(false);
    expect(urlCondition.truth('http://##/')).toBe(false);
    expect(urlCondition.truth('//')).toBe(false);
    expect(urlCondition.truth('//a')).toBe(false);
    expect(urlCondition.truth('///a')).toBe(false);
    expect(urlCondition.truth('///')).toBe(false);
    expect(urlCondition.truth('http:///a')).toBe(false);
    expect(urlCondition.truth('foo.com')).toBe(false);
    expect(urlCondition.truth('rdar://1234')).toBe(false);
    expect(urlCondition.truth('h://test')).toBe(false);
    expect(urlCondition.truth('http:// shouldfail.com')).toBe(false);
    expect(urlCondition.truth('://shouldfail')).toBe(false);
    expect(urlCondition.truth('ftps://foo.bar/')).toBe(false);
    expect(urlCondition.truth('http://-error-.invalid/')).toBe(false);
    expect(urlCondition.truth('http://-a.b.co')).toBe(false);
    expect(urlCondition.truth('http://3628126748')).toBe(false);
    expect(urlCondition.truth('http://10.1.1.1')).toBe(false);
    expect(urlCondition.truth('http://10.1.1.254')).toBe(false);
    /*
        expect(urlCondition.truth('http://foo.bar?q=Spaces should be encoded')).toBe(false);
        expect(urlCondition.truth('http://foo.bar/foo(bar)bazquux')).toBe(false);
        expect(urlCondition.truth('http://a.b--c.de/')).toBe(false);
        expect(urlCondition.truth('http://a.b-.co')).toBe(false);
        expect(urlCondition.truth('http://1.1.1.1.1')).toBe(false);
        expect(urlCondition.truth('http://123.123.123')).toBe(false);
        expect(urlCondition.truth('http://.www.foo.bar/')).toBe(false);
        expect(urlCondition.truth('http://www.foo.bar./')).toBe(false);
        expect(urlCondition.truth('http://.www.foo.bar./')).toBe(false);
    */
});

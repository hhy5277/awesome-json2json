const assert = require('assert');
const json2json = require('..').default;

const FOO_BAR_BAZ = {
    foo: {
        bar: {
            baz: 1
        }
    }
}
const ARRAY_FOO_BAR = {
    foo: [
        { bar: 1 },
        { bar: 2 },
        { bar: 3 }
    ]
}

describe('json2json', () => {
    describe('string template', () => {
        it('should match foo.bar.baz value', () => {
            assert.deepEqual(json2json(FOO_BAR_BAZ, {
                new_foo: 'foo.bar.baz'
            }), {
                new_foo: 1
            });
        });
        it('should get undefined', () => {
            assert.deepEqual(json2json(FOO_BAR_BAZ, {
                new_foo: 'foo.bar.baz.qux'
            }), {
                new_foo: undefined
            });
        });
        it('should throw error', () => {
            assert.throws(() => {
                json2json(FOO_BAR_BAZ, {
                    new_foo: 'foo.bar.baz.qux.quux'
                });
            }, /^TypeError: Cannot read property 'quux' of undefined$/);
        });
        it('should get undefined when optional chaining get undefined', () => {
            assert.deepEqual(json2json(FOO_BAR_BAZ, {
                new_foo: 'foo.not_exist_key?.bar.baz'
            }), {
                new_foo: undefined
            });
        });
    });
    describe('function template', () => {
        it('should match formatted', () => {
            assert.deepEqual(json2json(FOO_BAR_BAZ, {
                new_foo: (root) => root.foo.bar.baz + '_formatted'
            }), {
                new_foo: '1_formatted'
            });
        });
    });
    describe('object template', () => {
        it('should match $path result', () => {
            assert.deepEqual(json2json(FOO_BAR_BAZ, {
                new_foo: {
                    $path: 'foo.bar.baz'
                }
            }), {
                new_foo: 1
            });
        });
        it('should match $formatting result', () => {
            assert.deepEqual(json2json(FOO_BAR_BAZ, {
                new_foo: {
                    $formatting: (root) => {
                        return root.foo.bar.baz + '_formatted';
                    }
                }
            }), {
                new_foo: '1_formatted'
            });
        });
        it('should match $path and $formatting result', () => {
            assert.deepEqual(json2json(FOO_BAR_BAZ, {
                new_foo: {
                    $path: 'foo.bar',
                    $formatting: (bar) => {
                        return bar.baz + '_formatted';
                    }
                }
            }), {
                new_foo: '1_formatted'
            });
        });
        it('should match nested string template value', () => {
            assert.deepEqual(json2json(FOO_BAR_BAZ, {
                new_foo: {
                    new_bar: 'foo.bar.baz'
                }
            }), {
                new_foo: {
                    new_bar: 1
                }
            });
        });
        it('should match nested $path template value', () => {
            assert.deepEqual(json2json(FOO_BAR_BAZ, {
                new_foo: {
                    $path: 'foo',
                    new_bar: 'bar.baz'
                }
            }), {
                new_foo: {
                    new_bar: 1
                }
            });
        });
        it('should match nested $path and $formatting template value', () => {
            assert.deepEqual(json2json(FOO_BAR_BAZ, {
                new_foo: {
                    $path: 'foo',
                    $formatting: (foo) => {
                        return {
                            baz2: foo.bar.baz + '_formatted'
                        }
                    },
                    new_bar: 'baz2'
                }
            }), {
                new_foo: {
                    new_bar: '1_formatted'
                }
            });
        });
        it('should match nested $path and $root template value', () => {
            assert.deepEqual(json2json(FOO_BAR_BAZ, {
                new_foo: {
                    $path: 'foo',
                    new_bar: {
                        $path: 'bar',
                        new_baz1: 'baz',
                        new_baz2: '$root.foo'
                    }
                }
            }), {
                new_foo: {
                    new_bar: {
                        new_baz1: 1,
                        new_baz2: {
                            bar: {
                                baz: 1
                            }
                        }
                    }
                }
            });
        });
    });
    describe('array template', () => {
        it('should match arrayed result', () => {
            assert.deepEqual(json2json(ARRAY_FOO_BAR, {
                new_foo: 'foo[].bar'
            }), {
                new_foo: [
                    1,
                    2,
                    3
                ]
            });
        });
        it('should match arrayed $path result', () => {
            assert.deepEqual(json2json(ARRAY_FOO_BAR, {
                new_foo: {
                    $path: 'foo[].bar'
                }
            }), {
                new_foo: [
                    1,
                    2,
                    3
                ]
            });
        });
        it('should match arrayed $path and $formatting result', () => {
            assert.deepEqual(json2json(ARRAY_FOO_BAR, {
                new_foo: {
                    $path: 'foo[].bar',
                    $formatting: (barValue) => barValue + '_formatted'
                }
            }), {
                new_foo: [
                    '1_formatted',
                    '2_formatted',
                    '3_formatted'
                ]
            });
        });
        it('should match arrayed nested result', () => {
            assert.deepEqual(json2json(ARRAY_FOO_BAR, {
                new_foo: {
                    $path: 'foo[]',
                    new_bar: {
                        $formatting: (fooItem) => {
                            return fooItem.bar;
                        }
                    }
                }
            }), {
                new_foo: [
                    { new_bar: 1 },
                    { new_bar: 2 },
                    { new_bar: 3 }
                ]
            });
        });
        it('should match nested arrayed result', () => {
            assert.deepEqual(json2json(ARRAY_FOO_BAR, {
                new_foo: {
                    $path: 'foo',
                    new_bar: {
                        $path: '[]',
                        $formatting: (fooItem) => {
                            return fooItem.bar;
                        }
                    }
                }
            }), {
                new_foo: {
                    new_bar: [
                        1, 2, 3
                    ]
                }
            });
        });
    });
});
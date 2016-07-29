var expect = require('expect.js');
var State = require('../').State;

describe('State', function() {
    it('State.set: should properly set/remove internal fields', function() {
        var obj = State.set({
            root : {
                a : 'A',
                b : 'B'
            }
        }, 'root.a', undefined);
        expect(obj).to.eql({
            root : {
                b : 'B'
            }
        })
    });

    it('should reflect the data changes', function() {
        var state = {
            ui : {
                page : 'login'
            },
            account : {
                login : null,
                valid : false
            },
        };
        var root = new State(state, function(ev) {
            state = ev.state;
        });
        expect(root()).to.be(state);
        var page = root.cursor('ui.page');
        var account = root.cursor('account');
        var login1 = root.cursor('account.login');
        var login2 = account.cursor('login');
        expect(page()).to.eql('login');
        expect(account()).to.eql({
            login : null,
            valid : false
        });
        expect(login1()).to.be(null);
        expect(login2()).to.be(null);

        page('home');
        expect(page()).to.eql('home');
        account({
            login : 'foo',
            valid : true
        });
        expect(account()).to.eql({
            login : 'foo',
            valid : true
        });
        expect(login1()).to.eql('foo');
        expect(login2()).to.be('foo');
        expect(state).to.eql({
            ui : {
                page : 'home'
            },
            account : {
                login : 'foo',
                valid : true
            }
        });
        expect(root()).to.be(state);
        expect(root.state()).to.be(state);
        expect(page.state()).to.be(state);
        expect(account.state()).to.be(state);

        var tutu = root.cursor('toto.titi.tata.tutu');
        expect(tutu()).to.be(undefined);
        expect(root()).to.eql({
            ui : {
                page : 'home'
            },
            account : {
                login : 'foo',
                valid : true
            }
        });
        tutu('Hello');
        expect(tutu()).to.eql('Hello');
        expect(root()).to.eql({
            ui : {
                page : 'home'
            },
            account : {
                login : 'foo',
                valid : true
            },
            toto : {
                titi : {
                    tata : {
                        tutu : 'Hello'
                    }
                }
            }
        });
        expect(tutu.root()).to.be(root);
    });

    it('should properly copy internal fields', function() {
        var state;
        var root = new State(function(ev) {
            state = ev.state;
        });
        expect(root()).to.eql({});
        root.cursor('a.b.c')('Hello');
        expect(root()).to.eql({
            a : {
                b : {
                    c : 'Hello'
                }
            }
        });
        root.cursor('a.b.d')('World');
        expect(root()).to.eql({
            a : {
                b : {
                    c : 'Hello',
                    d : 'World'
                }
            }
        });
        root.cursor('a.e')('ABC');
        expect(root()).to.eql({
            a : {
                b : {
                    c : 'Hello',
                    d : 'World'
                },
                e : 'ABC'
            }
        });
        root.cursor('a.b')('CBA');
        expect(root()).to.eql({
            a : {
                b : 'CBA',
                e : 'ABC'
            }
        });
        root.cursor('a.b')(undefined);
        expect(root()).to.eql({
            a : {
                e : 'ABC'
            }
        });
    });
});
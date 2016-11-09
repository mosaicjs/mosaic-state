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

  it('should wrap object methods with the state.set call', function() {
    var test;
    var state = new State(function(ev) {
      test = ev.state;
    });
    var obj = state.wrap({
      hello : function(str) {
        state.cursor('message')('Hello ' + str + '!');
      }
    })
    expect(typeof obj).to.be('object');
    expect(typeof obj.hello).to.be('function');
    expect(test).to.be(undefined);
    obj.hello('world');
    expect(test).to.eql({
      message : 'Hello world!'
    });
  });

  it('should wrap classes and create instances '
      + 'with methods wrapped in the state.set calls', function() {
    function Counter(state) {
      this.cursor = state.cursor('counter');
    }
    Counter.prototype.inc = function(val) {
      var value = (this.cursor() || 0) + val;
      this.cursor(value);
      return value;
    }
    Counter.prototype.dec = function(val) {
      return this.inc(-val);
    }
    Counter.prototype.mul = function(val) {
      var value = (this.cursor() || 0) * val;
      this.cursor(value);
      return value;
    }
    Counter.prototype.div = function(val) {
      return this.mul(1 / val);
    }

    var msg;
    var test;
    var state = new State(function(ev) {
      test = ev.state;
    });
    var counter = state.wrap(Counter);
    expect(typeof counter).to.be('object');
    expect(typeof counter.inc).to.be('function');
    expect(typeof counter.dec).to.be('function');
    expect(typeof counter.mul).to.be('function');
    expect(typeof counter.div).to.be('function');
    expect(msg).to.be(undefined);

    counter.inc(3);
    expect(test).to.eql({
      counter : 3
    });
    counter.inc(32);
    expect(test).to.eql({
      counter : 35
    });
    counter.div(5);
    expect(test).to.eql({
      counter : 7
    });
    counter.mul(-8);
    expect(test).to.eql({
      counter : -56
    });
  });
});
var expect = require('expect.js');
var State = require('../').State;
var syncStates = require('../').syncStates;

describe('StateSync', function() {

    it('should reflect the data changes', function() {
        var first, second;
        var firstState = new State(function(ev) {
            first = ev.state;
        });
        var secondState = new State(function(ev) {
            second = ev.state;
        });

        syncStates(firstState, secondState, {
            'show.organizations' : 'ui.organizations.show',
            'show.clients' : 'ui.clients.show',
            'clients' : 'ui.clients'
        });
        expect(firstState.cursor('show.organizations')()).to.be(undefined);
        expect(secondState.cursor('ui.organizations.show')()).to.be(undefined);
        expect(firstState.cursor('show.clients')()).to.be(undefined);
        expect(secondState.cursor('ui.clients.show')()).to.be(undefined);

        firstState.cursor('show.organizations')(true);
        expect(firstState.cursor('show.organizations')()).to.be(true);
        expect(secondState.cursor('ui.organizations.show')()).to.be(true);
        expect(firstState.cursor('show.clients')()).to.be(undefined);
        expect(secondState.cursor('ui.clients.show')()).to.be(undefined);

        secondState.cursor('ui.clients.show')(true);
        expect(firstState.cursor('show.organizations')()).to.be(true);
        expect(secondState.cursor('ui.organizations.show')()).to.be(true);
        expect(firstState.cursor('show.clients')()).to.be(true);
        expect(secondState.cursor('ui.clients.show')()).to.be(true);

        secondState.cursor('ui.clients')({
            list : [ 'first' ]
        });
        expect(firstState.cursor('show.organizations')()).to.be(true);
        expect(secondState.cursor('ui.organizations.show')()).to.be(true);
        expect(firstState.cursor('show.clients')()).to.be(undefined);
        expect(secondState.cursor('ui.clients.show')()).to.be(undefined);

        secondState.cursor('ui.clients.popup.position')([ 100, 200 ]);
        expect(second).to.eql({
            "ui" : {
                "clients" : {
                    "list" : [ "first" ],
                    "popup" : {
                        "position" : [ 100, 200 ]
                    }
                },
                "organizations" : {
                    "show" : true
                }
            }
        });
        expect(first).to.eql({
            "clients" : {
                "list" : [ "first" ],
                "popup" : {
                    "position" : [ 100, 200 ]
                }
            },
            "show" : {
                "organizations" : true
            }
        });
        secondState.cursor('ui')({
            clients : {
                show : false,
            },
            organizations : {
                show : false
            }
        });
        expect(first).to.eql({
            "show" : {
                "organizations" : false,
                "clients" : false
            },
            "clients" : {
                "show" : false
            }
        });
        expect(second).to.eql({
            ui : {
                "clients" : {
                    "show" : false
                },
                "organizations" : {
                    "show" : false
                }
            }
        });
        secondState.cursor('clients')({});
    });
});
# mosaic-state

A very light-weight state management library.
It allows to manage immutable state objects using cursors. 
Each cursor can update a individual branch in the state tree corresponding
to the specified path. Cursor do not change the original state, they 
create a new copy of the global state, copies non-changed branches and 
replace values corresponding to cursor path. 

Example: 
```
var state = { msg: 'Hello' };
var root = new State(state, function(ev){
    state = ev.state;
});

console.log(root()); // {msg:'Hello'} 

var address = root.cursor('user.address');
console.log(address()); // undefined
address({
    country : 'France',
    city : 'Paris',
    street : 'rue Rivoli',
    building : 1
});
console.log(address()); // {country:'France',city:'Paris', .... }

/*
{
    user : {
        address : {
            country : 'France',
            city : 'Paris',
            street : 'rue Rivoli',
            building : 1
        }
    }
}
*/
console.log(state, root()); 




```

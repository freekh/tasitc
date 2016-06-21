## TODO
Only for my eyes, the syntax propositions...

```js
    // const text = 'ls ~ | div $.path';
    // const text = 'ls /freekh';
    // https://term.tasitc.com/tasitc/core/dom/div##foo [#foo]
    // https://api.tasitc.com/freekh/div
    // `ls |> :js { (ctx) => 'hello' + ctx.path }`
    // `css { div { color: red; } }`
    // `ls | :li.Elem $.path | html { :ul $ }`
    // `for [ls, :li]`; $[0] |> map $[1]
    // `ls |> map (:li $.path)`
    // `ls |> flatmap (:li [$.path])`
    // `ls |> reduce [0, concat]`
    // `html [ :style css { div { color: red; } }, ]` 
    // `html { :div [.foo]) }`;
    // `html :div ['test'])`;
    // `html :div [.foo 'test']`;
    // `html :div [{} 'test']`;
    // `html :div [.foo {}]`;
    // `html :div.foo [{} 'test']`;

    // ls |> {
    //   [ { path: 'path' }, ?] if (:gt (:len ?node.path) 10) => ?node.path
    //   ? => fail
    // }

    // ls |> transduce [map $.path, flatmap :li] ;;ls | $.path | :li
    // ls |> map $.path |> flatmap :span#char |> html > foo
    // ls |> map $.path | :span#char |> html > foo

    // mount (/github/freekh --account=(ls ~/.accounts/github |> $[0])) > ~/github
    // ln ~/github/tasitc/trees/release > ~/myapp/code
    // cd ~/myapp
    // hook [
    //   ./package.json
    //   :/js/lock ./package.json |> ifte [eq [$.sha1  ./lock |> $.sha1], $, ./lock]
    // ] > ./lock
    // hook [

    //   [./code/**.js, ./lock]
    //   /browersify { entry: ./code/index.js, babelify: true } |> /tgz
    // ] > ./main.js.tgz
    // expose main.js.tgz
    // html [
    //   :body [
    //     :div#entry.test
    //     :script (url ./main.js.tgz)
    //   ]
    // ] >> ./index.html
    // expose index.html
    // ALT:
    // html [
    //   :body [
    //     :ul (ls |> map (:li $.path))
    //   ]
    // ]
    // ls |> map (if [{ ?path }, 'nope'])
    // { ?path, foo: 'value' } |> if [(gt [len $, 10]), ]
    // [ ?one, ?two, ?rest ]

    //const text = `ls | map $.path | $[0] | ifte [contains 'freekh', $, 'nope'] | html`;
    //const text = `request /tasitc/core/ns/list > /tasitc/ns/ls`; // or request --get ?,  should it be possible to write request --verb='get' > /tasitc/requests/get
    //const text = `map > /mapalt`; //%{ } / %&
    //const text = `[ls, 'freekh'] | swap map ifte [$.path | contains, $.name, 'nope']`;
    // ls | map $.path | filter 'freekh'
    // filter => [$, 'freekh'] | flatmap ifte [$[0] | contains $[1], [$[0]], []]
    //const text = `$ | filter 'freekh'`;
    // const text= `[['hello'], ['world']] | flatmap`;
    const text = `[['hello'], ['world']] | flatmap $`;
    //const text = `foo < js ((context, argument) => { return context + argument; })`; // ls | map :foo 'yeah'
    // dup 0 eq | [ pop 1 ] | [ dup 1 - fac * ] | if > fac

    // map ifte [$ | contains ?.sql, [$], []] > filter
    // ls | filter 'freekh'
    // '/tasitc/ns/core/ls' | request --get ? > ls
    // ls | sort | map psql { sql: "select $.name from names" }
    // '/tasitc/db/psql' | request --credentials=(credentials 'psql') ?.sql
    //const text = `ls | map $.path | /freekh/filter 'zoo'`;
    //const text = `ls | map $.path | filter 'freekh'`;
    //const text = `ls | map ifte [$.path | contains 'freekh', :li $.name, 'nope'] | html`;
    //const text = `ls | map ifte [$.path | contains 'freekh', 'yes', 'nope']`;
    // const text = `ls | map :li $.name`;
    // ls |> [map, ifte [ge [(len $.path) 200], $.path, 'too long']]
    test.done();
```

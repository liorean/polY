/*
Translation of variadric fix point combinator to ES6 using minimal features:
- Relying only on the new syntax of fat arrows, spread operator and rest parameters.
- (let declarations, assignments and destructuring assignments just for making code more readable.)
- Using only void, equality and conditional operators (except in testing code).
- Also includes a really compact variant using Array.prototype.map built in.

Based on http://okmij.org/ftp/Computation/fixed-point-combinators.html
I can honestly not claim any originality or creativity here.

The print function is part of the SpiderMonkey shell.
In ES6Fiddle, replace with console.log calls instead. (http://www.es6fiddle.com/i8laijui/)

*/
let
    fix=(((f)=>(g)=>(h)=>(f(h)(g(h))))
        ((f)=>(g)=>(..._)=>(f(g(g)))(..._))
        ((f)=>(g)=>(..._)=>(f(g(g)))(..._))),
    map=fix(
        (self)=>(f,...a)=>(b,...c)=>(
            (b===void 0)
            ?(a)
            :(self(f,...a,f(b))(...c)))),
    apply=fix(
        (self)=>(f)=>(a,...b)=>(
            (a===void 0)
            ?(f)
            :(self(f(a))(...b)))),
    currypolyfixl=
        (l)=>(
            ((u)=>(u(u)))
            ((p)=>(
                map(
                    ((li)=>(
                        (...x)=>(
                            apply(
                                apply(li)
                                (...p(p)))
                            (...x)))))
                (...l)))),
    currypolyfix=(...l)=>(currypolyfixl(l)), // Accepts arguments of the form f1=>f2=>…=>fn=>(fnbody)
    flatpolyfixl=
        (l)=>(
            ((u)=>(u(u)))
            ((p)=>(
                map(
                    ((li)=>(
                        (...x)=>(
                            li(...p(p)))(...x)))))
                (...l))),
    flatpolyfix=(...l)=>(flatpolyfixl(l)), // Accepts arguments of the form (f1,f2,…,fn)=>(fnbody)

// ...or just a version using the built in  Array.prototype.map.
    polyfix= // Accepts arguments of the form f1=>f2=>…=>fn=>(fnbody)
        (...l)=>(
            (u=>u(u))
            (p=>l.map(f=>(...x)=>f(...p(p))(...x)))),
    [even,odd]=
        polyfix(
            (even,odd)=>n=>(n===0)||odd(n-1),
            (even,odd)=>n=>(n!==0)&&even(n-1)),

//Testing code:
    flatopen_fact=(fact)=>(n,m=1)=>((n<2)?(m):(fact(n-1,n*m))),
    flatopen_even=(even,odd)=>(n)=>((n===0)||(odd(n-1))),
    flatopen_odd=(even,odd)=>(n)=>((n!==0)&&(even(n-1))),
    flatopen_mod3eq0=(t0,t1,t2)=>(n)=>((n===0)||(t2(n-1))),
    flatopen_mod3eq1=(t0,t1,t2)=>(n)=>((n!==0)&&((n===1)||(t0(n-1)))),
    flatopen_mod3eq2=(t0,t1,t2)=>(n)=>((n===2)||((2<n)&&(t1(n-1)))),
    [flatfact]=flatpolyfix(flatopen_fact),
    [flateven,flatodd]=flatpolyfix(flatopen_even,flatopen_odd),
    [flatmod3eq0,flatmod3eq1,flatmod3eq2]=flatpolyfix(flatopen_mod3eq0,flatopen_mod3eq1,flatopen_mod3eq2),

    curryopen_fact=(fact)=>(n)=>(m=1)=>((n<2)?(m):(fact(n-1)(n*m))),
    curryopen_even=(even)=>(odd)=>(n)=>((n===0)||(odd(n-1))),
    curryopen_odd=(even)=>(odd)=>(n)=>((n!==0)&&(even(n-1))),
    curryopen_mod3eq0=(t0)=>(t1)=>(t2)=>(n)=>((n===0)||(t2(n-1))),
    curryopen_mod3eq1=(t0)=>(t1)=>(t2)=>(n)=>((n!==0)&&((n===1)||(t0(n-1)))),
    curryopen_mod3eq2=(t0)=>(t1)=>(t2)=>(n)=>((n===2)||((2<n)&&(t1(n-1)))),
    [curryfact]=currypolyfix(curryopen_fact),
    [curryeven,curryodd]=currypolyfix(curryopen_even,curryopen_odd),
    [currymod3eq0,currymod3eq1,currymod3eq2]=currypolyfix(curryopen_mod3eq0,curryopen_mod3eq1,curryopen_mod3eq2);

print([0,1,2,3,4,5].map((n)=>(n+':\tfact:\t'+flatfact(n)+'\teven:\t'+flateven(n)+'\todd:\t'+flatodd(n)+'\t%3===0:\t'+flatmod3eq0(n)+'\t%3===1:\t'+flatmod3eq1(n)+'\t%3===2:\t'+flatmod3eq2(n)+'\n')).join(''));
/* Flats, according to SpiderMonkey shell: (print instead of console.log)
0:      fact:   1       even:   true    odd:    false   %3===0: true    %3===1: false   %3===2: false
1:      fact:   1       even:   false   odd:    true    %3===0: false   %3===1: true    %3===2: false
2:      fact:   2       even:   true    odd:    false   %3===0: false   %3===1: false   %3===2: true
3:      fact:   6       even:   false   odd:    true    %3===0: true    %3===1: false   %3===2: false
4:      fact:   24      even:   true    odd:    false   %3===0: false   %3===1: true    %3===2: false
5:      fact:   120     even:   false   odd:    true    %3===0: false   %3===1: false   %3===2: true
*/

print([0,1,2,3,4,5].map((n)=>(n+':\tfact:\t'+curryfact(n)()+'\teven:\t'+curryeven(n)+'\todd:\t'+curryodd(n)+'\t%3===0:\t'+currymod3eq0(n)+'\t%3===1:\t'+currymod3eq1(n)+'\t%3===2:\t'+currymod3eq2(n)+'\n')).join(''));
/* Curried, according to SpiderMonkey shell: (print instead of console.log)
0:      fact:   1       even:   true    odd:    false   %3===0: true    %3===1: false   %3===2: false
1:      fact:   1       even:   false   odd:    true    %3===0: false   %3===1: true    %3===2: false
2:      fact:   2       even:   true    odd:    false   %3===0: false   %3===1: false   %3===2: true
3:      fact:   6       even:   false   odd:    true    %3===0: true    %3===1: false   %3===2: false
4:      fact:   24      even:   true    odd:    false   %3===0: false   %3===1: true    %3===2: false
5:      fact:   120     even:   false   odd:    true    %3===0: false   %3===1: false   %3===2: true
*/

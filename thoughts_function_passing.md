map ?.val + 1



const test = () => (val) => val

same as:
test @.@.val


const test2 = (val1) => (val2_1, val2_2) => val1 + val2_1 + val2_2

test2 < @.val1 + @.@.val2_1 + @.@.val2_2

test2 < (
    let (val1, (val2_1, val2_2)) = (@, @.@)
    val1 + val2_1 + val2_2
)

test2 < (val1 = @ | (val2_1, val2_2) = @.@
    val1 + val2_1 + val2_2
)

test2 < @(
    ?.val1 + @(?.val2_1 + ?.val2_2) 
)

test2 < @.val1 + @(@.val2_1 + @.val2_2)


test2 { val1 : 1 } | { val2_1: 2, val2_2: 3 } # 6
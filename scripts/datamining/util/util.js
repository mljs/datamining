define(function(){
    
    function initArray(length, value) {
        if(typeof value === "undefined") value = 0;
        var array = new Array(length), i=0;
        for(; i < length; array[i++] = value);
        return array;
    }
    
    return {
        initArray : initArray
    };
    
});
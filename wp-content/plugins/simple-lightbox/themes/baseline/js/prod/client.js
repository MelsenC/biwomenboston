window.SLB && SLB.has_child("View.extend_theme") && !function() {
    SLB.View.extend_theme("slb_baseline", {
        breakpoints: {
            small: 480,
            large: 1024
        },
        offset: function() {
            var o;
            return o = document.documentElement.clientWidth > this.get_breakpoint("small") ? {
                width: 32,
                height: 55
            } : {
                width: 0,
                height: 0
            }
        },
        margin: function() {
            var m;
            return m = document.documentElement.clientWidth > this.get_breakpoint("small") ? {
                height: 50,
                width: 20
            } : {
                height: 0,
                width: 0
            }
        }
    })
}();

window.SLB && SLB.has_child("View.extend_content_handler") && !function($) {
    SLB.View.extend_content_handler("image", {
        render: function(item, dfr) {
            var img = new Image
              , handler = function() {
                item.set_data(img),
                item.set_attribute("dimensions", {
                    width: img.width,
                    height: img.height
                });
                var out = $("<img />", {
                    src: item.get_uri()
                });
                dfr.resolve(out)
            };
            return $(img).on("load", function(e) {
                handler(e)
            }),
            img.src = item.get_uri(),
            dfr.promise()
        }
    })
}(jQuery);

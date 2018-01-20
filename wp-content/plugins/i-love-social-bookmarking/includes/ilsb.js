// JavaScript Document
jQuery(document).ready(function()
{
	jQuery(".ilsb-parent").hover(
		function()
		{
			jQuery(".ilsb-child").show();
		},
		function()
		{
			jQuery(".ilsb-child").hide();
		}
	);
	
	jQuery(".ilsb-parent > a").click(function()
	{
		return false;
	});
});

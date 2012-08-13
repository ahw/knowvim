$(document).ready(function() {
    $("#homelink").hover(
        function() {
            if (colorscheme == "minimal") {
                $(this).css("color", "#DDD");
            } else {
                $(this).css("color", "white");
            }
        },
        function() {
            $(this).css("color", "#555");
    });
    $(".source_code_link").hover(
        function() {
            if (colorscheme == "minimal") {
                $(this).css("color", "#DDD");
            } else {
                $(this).css("color", "white");
            }
        },
        function() {
            $(this).css("color", "#555");
            $(".current_page").css("color", beta_color);
    });

    $(".source_code_link").click(function() {
        // Make the current page link color gray.
        $(".current_page").css("color", "#555");
        // Remove the .curreng_page class from all links (this only affects
        // 1 link but whatever).
        $(".source_code_link").removeClass("current_page");
        // Highlight the current page link color.
        $(this).css("color", beta_color);
    });

    // Hide write output panel on link click.
    $("#write_output_panel_hide_link").click(function() {
        $("#write_output").slideUp('fast');
    });

    // Toggle visibility of instruction panel on link click.
    $("#instruction_panel_show_link").click(function() {
        $("#instruction_panel").slideToggle('fast', function() {
            var contents = $("#instruction_panel_show_link").html();
            if (contents.charAt(0) == 'S') {
                $("#instruction_panel_show_link").html("Hide instructions.");
            } else {
                $("#instruction_panel_show_link").html("Show instructions.");
            }
        });
    });

    // Always close panel on instruction_panel_hide_link click.
    $("#instruction_panel_hide_link").click(function() {
        $("#instruction_panel").slideUp('fast', function() {
            $("#instruction_panel_show_link").html("Show instructions.");
        });
    });

    // Toggle visibility of settings panel on link click.
    $("#settings_show_link").click(function() {
        var contents = $("#settings_show_link").html();
        $("#num_display_lines_value").html(num_display_lines);
        $("#colorscheme_value").html(colorscheme);
        if (write_output == true) {
            $("#writeoutput_value").html("on");
        } else {
            $("#writeoutput_value").html("off");
        }
        $("#settings").slideToggle('fast', function() {
            if (contents.charAt(0) == 'S') {
                $("#settings_show_link").html("Hide settings.");
            } else {
                $("#settings_show_link").html("Show settings.");
            }
        });
    });

    // Always close panel on settings_hide_link click.
    $("#settings_hide_link").click(function() {
        $("#settings").slideUp('fast', function() {
            $("#settings_show_link").html("Show settings.");
        });
    });

    // Toggle visibility of commands panel on link click.
    $("#basic_commands_panel_show_link").click(function() {
        $("#basic_commands_panel").slideToggle('fast', function() {
            var contents = $("#basic_commands_panel_show_link").html();
            if (contents.charAt(0) == 'S') {
                $("#basic_commands_panel_show_link").html("Hide basic commands.");
            } else {
                $("#basic_commands_panel_show_link").html("Show basic commands.");
            }
        });
    });

    // Always close panel on comands_panel_hide_link click.
    $("#basic_commands_panel_hide_link").click(function() {
        $("#basic_commands_panel").slideUp('fast', function() {
            $("#basic_commands_panel_show_link").html("Show basic commands.");
        });
    });

    // Toggle visibility of commands panel on link click.
    $("#advanced_commands_panel_show_link").click(function() {
        $("#advanced_commands_panel").slideToggle('fast', function() {
            var contents = $("#advanced_commands_panel_show_link").html();
            if (contents.charAt(0) == 'S') {
                $("#advanced_commands_panel_show_link").html("Hide advanced commands.");
            } else {
                $("#advanced_commands_panel_show_link").html("Show advanced commands.");
            }
        });
    });

    // Always close panel on comands_panel_hide_link click.
    $("#advanced_commands_panel_hide_link").click(function() {
        $("#advanced_commands_panel").slideUp('fast', function() {
            $("#advanced_commands_panel_show_link").html("Show advanced commands.");
        });
    });
});


$(document).ready(function () {

    $('#loader').hide()
    $('#errorMsg').hide()
    
    $("#loginBtn").click(function (e) { 
        e.preventDefault();

        $("#text").hide()
        $('#loader').show()
        $('#loginBtn').prop('disabled', true);
        $("#loader").addClass("spinner")

        let newData = {username: $("#username").val(), password: $("#password").val()}
        
        $.post("/login", newData,
            function (data, textStatus, jqXHR) {
                if(textStatus == "success") {
                    let {err,msg,success} = data
                    if(success) {
                        window.location.replace("/dashboard")
                    } else {
                        $("#errorMsg").show()
                        $("#errorMsg").text(msg)
                        $('#loginBtn').prop('disabled', false);
                        $("#loader").removeClass("spinner")
                        $("#text").show()
                        $('#loader').hide()
                    }
                } else {
                    console.error("request no successful")
                }
            },
            "json"
        );
    });
});
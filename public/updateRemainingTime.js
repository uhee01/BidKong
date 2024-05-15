function updateRemainingTime(endTime, selector) {
    var now = new Date().getTime();
    var distance = endTime - now;

    if (distance > 0) {
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.querySelector(selector).innerHTML = days + "일 " + hours + "시간 "
        + minutes + "분 " + seconds + "초 ";
    } else {
        clearInterval(timer);
        document.querySelector(selector).innerHTML = "경매 종료";
    }
}

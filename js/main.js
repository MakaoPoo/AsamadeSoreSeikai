$(function() {
  const config = {
    apiKey: "AIzaSyBJ9spM0Gq02Jrq55TutDHVSDXKVW_mlfc",
    authDomain: "asamadesoreseikai.firebaseapp.com",
    databaseURL: "https://asamadesoreseikai.firebaseio.com",
    storageBucket: "asamadesoreseikai.appspot.com",
  };
  firebase.initializeApp(config);

  const db = firebase.database();

  const dbQuestion = db.ref('/question');
  dbQuestion.on("value", function(snapshot) {
    if(nowOdaiText != null) {
      playSound(dededenSE);
      resultEventFlag = false;
    }
    nowOdaiText = snapshot.val();
    const $odaiText = $('#odaitext');
    $odaiText.text(nowOdaiText).trigger('change');

    $('.fa-heart, .fa-poop').show();
    $('.fa-crown, .fa-poo').hide();
    $('.judge').empty();
  });

  const dbResultDisp = db.ref('/result_disp');
  dbResultDisp.on("value", function(snapshot) {
    if(snapshot.val()) {
      $('.fa-heart, .fa-poop').hide();

      const goodSumList = [];
      const badSumList = [];

      const dbJudge = db.ref('/user_list');
      dbJudge.once('value', function(snapshot) {
        const userList = snapshot.val();

        for(let userId = 0; userId < 8; userId++) {
          let sum = 0;
          const goodList = userList["user" + userId].judge.good;
          for(let fromId = 0; fromId < 8; fromId++) {
            sum += (goodList["from" + fromId])?1:0;
          }
          goodSumList.push(sum);

          sum = 0;
          const badList = userList["user" + userId].judge.bad;
          for(let fromId = 0; fromId < 8; fromId++) {
            sum += (badList["from" + fromId])?1:0;
          }
          badSumList.push(sum);
        }

        resultEvent(goodSumList, badSumList);
      });

    }
  });

  const dbTimerStart = db.ref('/timer');
  dbTimerStart.on("value", function(snapshot) {
    const start_time = snapshot.val().start_time;
    const timer_lenght = snapshot.val().timer_lenght;

    if(timerEvent != null) {
      window.clearTimeout(timerEvent);
    }

    $.ajax({
      type: 'GET'
    }).done(function(data, status, xhr) {
      const serverDate = new Date(xhr.getResponseHeader('Date'));
      globalTimestamp = serverDate.getTime();

      const date = new Date();
      const localTimestamp = date.getTime();

      errorTime = localTimestamp - globalTimestamp;

      if(globalTimestamp <= start_time + timer_lenght * 1000) {
        playSeSound(pi1SE);
        timerLoop(start_time, timer_lenght);
      }

    });
  });

  const resultEvent = function(goodSumList, badSumList) {
    resultEventFlag = true;
    playLoopSound(dramSE);

    dramroll(goodSumList, badSumList, 0);
  }

  const dramroll = function(goodSumList, badSumList, num) {
    if(!resultEventFlag) {
      return;
    }

    let max = 0;
    for(let userId = 0; userId < 8; userId++) {
      const goodNum = goodSumList[userId];
      const badNum = badSumList[userId];

      if(goodNum > max) { max = goodNum }
      if(badNum > max) { max = badNum }

      if(num > 0 && num <= goodNum) {
        const $goodIcon = $('<i class="fas fa-heart fa-2x pink"></i>');
        $goodIcon.css('top', 310 - num*35);
        const $judge = $('.user[data-id="' + userId + '"] .judge_good');
        $judge.append($goodIcon);
      }

      if(num > 0 && num <= badNum) {
        const $badIcon = $('<i class="fas fa-poop fa-2x brown"></i>');
        $badIcon.css('top', 310 - num*35);
        const $judge = $('.user[data-id="' + userId + '"] .judge_bad');
        $judge.append($badIcon);
      }
    }

    if(num >= max + 1) {
      const scoreList = [];
      let maxScore = 0;
      let minScore = 100;

      for(let userId = 0; userId < 8; userId++) {
        const goodNum = goodSumList[userId];
        const badNum = badSumList[userId];
        const score = goodNum*2 - badNum;
        scoreList.push(score);

        if(score > maxScore) { maxScore = score; }
        if(score < minScore) { minScore = score; }
      }
      playSound(dramendSE);

      window.setTimeout(function() {
        dsipWInnerEvent(scoreList, maxScore, minScore);
      }, 1000);
      return;
    }

    window.setTimeout(function() {
      dramroll(goodSumList, badSumList, num + 1);
    }, 400);
  }

  const dsipWInnerEvent = function(scoreList, maxScore, minScore) {
    if(!resultEventFlag) {
      return;
    }
    playSound(fanfareSE);
    console.log(scoreList);
    console.log(maxScore);
    console.log(minScore);
    for(let userId = 0; userId < 8; userId++) {
      if(scoreList[userId] == maxScore) {
        const $crown = $('.user[data-id='+userId+'] .fa-crown');
        $crown.show();
      } else if(scoreList[userId] == minScore) {
        const $poo = $('.user[data-id='+userId+'] .fa-poo');
        $poo.show();
      }
    }
  }

  for(let id = 0; id < 8; id++) {
    const dbAnswer = db.ref('/user_list/user' + id + '/answer');
    dbAnswer.on("value", function(snapshot) {
      const answerText = snapshot.val();
      const $user = $('.user[data-id="' + id + '"]');
      const $panel = $user.find('.panel');
      const $panelText = $user.find('.panel > p');
      $panelText.text(answerText);
      if(answerText != "") {
        playSeSound(dedenSE);
        $panel.addClass('open');
      } else {
        $panel.removeClass('open');
      }
    });

    const dbName = db.ref('/user_list/user' + id + '/name');
    dbName.on("value", function(snapshot) {
      const answerText = snapshot.val();
      const $user = $('.user[data-id="' + id + '"]');
      const $nameText = $user.find('.name > p');
      $nameText.text(answerText);
    });

    for(let fromId = 0; fromId < 8; fromId++) {
      const dbGood = db.ref('/user_list/user' + id + '/judge/good/from' + fromId);
      dbGood.on("value", function(snapshot) {
        const $selectUser = $('.user.selected');
        if($selectUser.length != 1) {
          return;
        }
        const myId = $selectUser.data('id');
        if(myId != fromId) {
          return;
        }

        const $heart = $('.user[data-id='+id+'] .name .fa-heart');
        if(snapshot.val()) {
          $heart.removeClass('gray');
          $heart.addClass('pink');
        } else {
          $heart.removeClass('pink');
          $heart.addClass('gray');
        }
      });

      const dbBad = db.ref('/user_list/user' + id + '/judge/bad/from' + fromId);
      dbBad.on("value", function(snapshot) {
        const $selectUser = $('.user.selected');
        if($selectUser.length != 1) {
          return;
        }
        const myId = $selectUser.data('id');
        if(myId != fromId) {
          return;
        }

        const $poop = $('.user[data-id='+id+'] .name .fa-poop');
        if(snapshot.val()) {
          $poop.removeClass('gray');
          $poop.addClass('brown');
        } else {
          $poop.removeClass('brown');
          $poop.addClass('gray');
        }
      });
    }
  }

  $('.panel').on('click', function() {
    $user = $(this).parent('.user');
    if($user.hasClass('selected')) {
      return;
    }
    const $nameText = $user.find('.name > p');
    const name = window.prompt("ユーザー名", $nameText.text());

    if(name != "" && name != null) {
      const id = $user.data('id');

      $('.user').removeClass('selected');
      $user.addClass('selected');

      const dbName = db.ref('/user_list/user' + id + '/name');
      dbName.set(name);

      for(let userId = 0; userId < 8; userId++) {
        const dbGood = db.ref('/user_list/user' + userId + '/judge/good/from' + id);
        dbGood.once("value", function(snapshot) {
          const $heart = $('.user[data-id='+userId+'] .name .fa-heart');
          if(snapshot.val()) {
            $heart.removeClass('gray');
            $heart.addClass('pink');
          } else {
            $heart.removeClass('pink');
            $heart.addClass('gray');
          }
        });

        const dbBad = db.ref('/user_list/user' + userId + '/judge/bad/from' + id);
        dbBad.once("value", function(snapshot) {
          const $poop = $('.user[data-id='+userId+'] .name .fa-poop');
          if(snapshot.val()) {
            $poop.removeClass('gray');
            $poop.addClass('brown');
          } else {
            $poop.removeClass('brown');
            $poop.addClass('gray');
          }
        });
      }

    } else if(name == "") {
      window.alert("ユーザー名が入力されていません");
    }
  });

  $('#odai_change_btn').on('click', function(e) {
    $('#mainmenu').slideUp(100);

    const $odaiText = $('#odaitext');
    const odaiText = window.prompt("お題", $odaiText.text());

    if(odaiText != "" && odaiText != null) {
      if(nowOdaiText == odaiText) {
        return;
      }
      console.log(odaiText);

      const dbQuestion = db.ref('/question');
      dbQuestion.set(odaiText);

      const dbResultDisp = db.ref('/result_disp');
      dbResultDisp.set(false);

      for(let userId = 0; userId < 8; userId++) {
        const dbAnswer = db.ref('/user_list/user' + userId + '/answer');
        dbAnswer.set("");

        for(let fromId = 0; fromId < 8; fromId++) {
          const dbGood = db.ref('/user_list/user' + userId + '/judge/good/from' + fromId);
          const dbBad = db.ref('/user_list/user' + userId + '/judge/bad/from' + fromId);

          dbGood.set(false);
          dbBad.set(false);
        }
      }
    }
  });

  $('#result_disp_btn').on('click', function(e) {
    const dbResultDisp = db.ref('/result_disp');
    dbResultDisp.set(true);

    $('#mainmenu').slideUp(100);
  });

  $('#odai_box_btn').on('click', function() {
    window.open('https://makaopoo.github.io/SoreSeikaiBox', '_blank'); // 新しいタブを開き、ページを表示

    $('#mainmenu').slideUp(100);
  });

  $('#timer_60s_btn').on('click', function() {
    $.ajax({
      type: 'GET'
    }).done(function(data, status, xhr) {
      const serverDate = new Date(xhr.getResponseHeader('Date'));
      globalTimestamp = serverDate.getTime();

      const timer = {
        start_time: globalTimestamp,
        timer_lenght: 60
      }

      const dbTimerStart = db.ref('/timer');
      dbTimerStart.set(timer);
    });

    $('#mainmenu').slideUp(100);
  });

  $('#timer_free_btn').on('click', function() {
    const timer_length_str = window.prompt("時間設定(s)", lastFreeTime);
    const timer_length = parseInt(timer_length_str, 10);

    if(timer_length_str == null) {
      return;
    }

    if(isNaN(timer_length) || timer_length_str == "") {
      window.alert('数値を入力してください');
      return;
    }

    $.ajax({
      type: 'GET'
    }).done(function(data, status, xhr) {
      const serverDate = new Date(xhr.getResponseHeader('Date'));
      globalTimestamp = serverDate.getTime();
      lastFreeTime = timer_length;

      const timer = {
        start_time: globalTimestamp,
        timer_lenght: timer_length
      }

      const dbTimerStart = db.ref('/timer');
      dbTimerStart.set(timer);
    });

    $('#mainmenu').slideUp(100);
  });

  $('#open_btn').on('click', function() {
    const $selectUser = $('.user.selected');
    if($selectUser.length != 1) {
      window.alert('フリップを選択してください');
      return;
    }
    const answer = $('#answer_input').val();
    if(answer == "" || answer == null) {
      window.alert('回答を入力してください');
      return;
    }

    const id = $selectUser.data('id');

    const dbAnswer = db.ref('/user_list/user' + id + '/answer');
    dbAnswer.set(answer);
  });

  $('#reset_btn').on('click', function() {
    const $selectUser = $('.user.selected');
    if($selectUser.length != 1) {
      window.alert('フリップを選択してください');
      return;
    }
    const id = $selectUser.data('id');

    const dbAnswer = db.ref('/user_list/user' + id + '/answer');
    dbAnswer.set("");
    $('#answer_input').val("");
  });

  $(window).on('load', function() {
    $(window).trigger('resize');
  });

  $(window).on('resize', function() {
    $('#odaitext').trigger('change');
  });

  $('#odaitext').on('change', function() {
    const headerHeight = $('#header').outerHeight();
    $('#main_area').css('padding-top', headerHeight);

    setMainmenu();
  });

  $('.fa-heart').on('click', function() {
    const $selectUser = $('.user.selected');
    if($selectUser.length != 1) {
      window.alert('フリップを選択してください');
      return;
    }
    const myId = $selectUser.data('id');
    const userId = $(this).parents('.user').data('id');
    const dbGood = db.ref('/user_list/user' + userId + '/judge/good/from' + myId);
    if($(this).hasClass('gray')) {
      dbGood.set(true);
      playSeSound(goodSE);
    } else {
      dbGood.set(false);
    }

    const $poop = $('.user[data-id='+userId+'] .fa-poop');
    const dbBad = db.ref('/user_list/user' + userId + '/judge/bad/from' + myId);
    if($poop.hasClass('brown')) {
      dbBad.set(false);
    }
  });

  $('.fa-poop').on('click', function() {
    const $selectUser = $('.user.selected');
    if($selectUser.length != 1) {
      window.alert('フリップを選択してください');
      return;
    }
    const myId = $selectUser.data('id');
    const userId = $(this).parents('.user').data('id');
    const dbBad = db.ref('/user_list/user' + userId + '/judge/bad/from' + myId);
    if($(this).hasClass('gray')) {
      dbBad.set(true);
      playSeSound(badSE);
    } else {
      dbBad.set(false);
    }

    const $heart = $('.user[data-id='+userId+'] .fa-heart');
    const dbGood = db.ref('/user_list/user' + userId + '/judge/good/from' + myId);
    if($heart.hasClass('pink')) {
      dbGood.set(false);
    }
  });

  $('#title').on('click', function() {
    if($('#mainmenu').css('display') == 'none') {
      $('#mainmenu').slideDown(100);
    } else {
      $('#mainmenu').slideUp(100);
    }
  });
});

let nowOdaiText = null;
let resultEventFlag = false;
let timerEvent = null;
let errorTime = 0;
let lastFreeTime = 60;

let dedenSE, dededenSE;
let dramSE, dramendSE, fanfareSE;
let goodSE, badSE;
let pi1SE, pi2SE;

$(window).on('mousedown touchdown', function() {
  initWebAPI();

  loadSound("deden.wav", function(bufferData) {
    dedenSE = bufferData;
  });

  loadSound("dededen.wav", function(bufferData) {
    dededenSE = bufferData;
  });

  loadSound("dram.wav", function(bufferData) {
    dramSE = bufferData;
  });

  loadSound("dramend.wav", function(bufferData) {
    dramendSE = bufferData;
  });

  loadSound("fanfare.wav", function(bufferData) {
    fanfareSE = bufferData;
  });

  loadSound("iine.wav", function(bufferData) {
    goodSE = bufferData;
  });

  loadSound("bcp.wav", function(bufferData) {
    badSE = bufferData;
  });

  loadSound("pi1.wav", function(bufferData) {
    pi1SE = bufferData;
  });

  loadSound("pi2.wav", function(bufferData) {
    pi2SE = bufferData;
  });

  $(window).off('mousedown touchdown');
});

const setMainmenu = function() {
  const titleLeft = $('#title').offset().left;
  const titleTop = $('#title').offset().top;
  const titleWidth = $('#title').innerWidth();
  const titleHeight = $('#title').outerHeight();
  $('#mainmenu').width(titleWidth);
  $('#mainmenu').css('left', titleLeft);
  $('#mainmenu').css('top', titleTop + titleHeight);
}

const timerLoop = function(start_time, timer_lenght) {
  const date = new Date();
  const nowTime = date.getTime() - errorTime;

  const nowSecond = Math.floor((nowTime - start_time) / 1000);
  const barWidth = (timer_lenght - nowSecond) / timer_lenght * 100;
  $('#timer_bar').width(barWidth + "%");
  $('#timer_text').text(timer_lenght - nowSecond + "s");

  if(nowSecond >= timer_lenght) {
    playSeSound(pi2SE);
    return;
  }

  timerEvent = window.setTimeout(function() {
    timerLoop(start_time, timer_lenght);
  }, 500);
}

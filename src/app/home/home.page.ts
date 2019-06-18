import { Component, OnChanges, OnInit } from '@angular/core';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Insomnia } from '@ionic-native/insomnia/ngx';
import { NavigationBar } from '@ionic-native/navigation-bar/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  elapsed: any = {
    h: '00',
    m: '00',
    s: '00'
  }
  progress: any = 0;
  overallProgress: any = 0;
  percent: number = 0;
  radius: number = 100;
  minutes: number = 1;
  seconds: any = 10;
  timer: any = false;
  overallTimer: any = false;
  fullTime: any = '00:00:15';
  
  beep: any = false;
  timeLeftClass: string = "";
  trainTimeClass: string = "";
  outerStrokesColor: string = "#33003F";

  countDownTimer: any = false;
  timeLeft: any = {
    m: '00',
    s: '00'
  };
  remainingTime:string = this.fullTime.slice(3,8);

  constructor(
    private insomnia: Insomnia,
    private nativeAudio: NativeAudio,
    private navigationBar: NavigationBar,
    
  ) {
    let autoHide: boolean = true;
    this.navigationBar.setUp(autoHide);
    
  }
  ngOninit() {
    this.nativeAudio.preloadSimple('beep', './assets/beep.mp3')
    this.nativeAudio.preloadSimple('final', './assets/final.mp3')
  }
  
  touchMe() {
    console.log('touched');
  }

  setRemainingTime(newValue) {
    this.remainingTime = newValue.slice(3, 8);
    this.fullTime = newValue;
  }

  startTimer() {
    if (this.countDownTimer) {
      clearInterval(this.countDownTimer);
      clearInterval(this.timer);
      if (this.beep) {
        clearInterval(this.beep);
      }
    }
    //SVG animation.
    let timeSplit = this.fullTime.split(':');
    this.minutes = timeSplit[1];
    this.seconds = timeSplit[2];
    
    this.percent = 0;
    this.progress = 0;

    let totalMilliSeconds = Math.floor(this.minutes * 6000) + (parseInt(this.seconds)*100);

    let forwardsTimer = () => {
      this.percent = Math.floor((this.progress / totalMilliSeconds) * 100);
      this.progress++
      if (this.percent >= this.radius) {
        clearInterval(this.beep);
        clearInterval(this.timer);
        this.outerStrokesColor = "#e9ff33";
        this.nativeAudio.play('final');
        setTimeout(() => {
          this.outerStrokesColor = "#33003F";
          this.percent = 0;
          this.timeLeftClass = "";
          this.nativeAudio.stop('final');
        },2500)
      }
    }
    
    //Resting Time Indicator.
    this.timeLeftClass = "text-white";
    let secondsLeft = totalMilliSeconds / 100;

    let backwardsTimer = () => {
      if (secondsLeft >= 0) {
        this.timeLeft.m = Math.floor(secondsLeft / 60)
        this.timeLeft.s = secondsLeft - (60 * this.timeLeft.m)
        this.remainingTime = `${this.pad(this.timeLeft.m, 2)}:${this.pad(this.timeLeft.s, 2)}`
        secondsLeft--;
      } else {
        setTimeout(() => {
          this.remainingTime = this.fullTime.slice(3, 8);
        }, 2500)
      }
      if (secondsLeft == 5) {
        this.beep = setInterval(() => {
          this.nativeAudio.play('beep');
        }, 1000)
      }
    }
    
    // run once when clicked
    forwardsTimer()
    backwardsTimer()
    // timers start 1 second later
    this.countDownTimer = setInterval(backwardsTimer, 1000)
    this.timer = setInterval(forwardsTimer, 10)
  }

  progressTimer() {
    if (this.overallTimer) {
      clearInterval(this.timer);
      clearInterval(this.countDownTimer);
      clearInterval(this.beep);
    }

    this.insomnia.keepAwake();
    this.trainTimeClass = "text-white"
    let countDownDate = new Date();

    this.overallTimer = setInterval(() => {
      let now = new Date().getTime();

      // Find the distance between now an the count down date
      var distance = now - countDownDate.getTime();

      // Time calculations for hours, minutes and seconds

      this.elapsed.h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      this.elapsed.m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      this.elapsed.s = Math.floor((distance % (1000 * 60)) / 1000);

      this.elapsed.h = this.pad(this.elapsed.h, 2);
      this.elapsed.m = this.pad(this.elapsed.m, 2);
      this.elapsed.s = this.pad(this.elapsed.s, 2);



    }, 1000)
  }

  stopTimer() {
    clearInterval(this.countDownTimer);
    clearInterval(this.timer);
    clearInterval(this.overallTimer);
    clearInterval(this.beep);
    this.countDownTimer = false;
    this.overallTimer = false;
    this.timer = false;
    this.percent = 0;
    this.progress = 0;
    this.trainTimeClass = "";
    this.elapsed = {
      h: '00',
      m: '00',
      s: '00'
    }
    this.timeLeft = {
      m: '00',
      s: '00'
    }
    this.remainingTime = this.fullTime.slice(3,8);
    this.insomnia.allowSleepAgain()
  }

  pad(num, size) {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
  }

  updateMyDate($event) {
    console.log($event.split(":"));
  }

}
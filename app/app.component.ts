import { Component } from 'angular2/core';
import { Auth } from './auth.service';
import { AuthHttp } from 'angular2-jwt';
import {RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';
import {ProfileComponent} from './profile.component';
import {FirebaseService} from './firebase.service';
import {Quest} from './quest.model';

@Component({
  selector: 'my-app',
  template: `
    <br><br>
    <nav class="navbar navbar-inverse">
      <div class="container-fluid">
        <!-- Brand and toggle get grouped for better mobile display -->
        <div class="navbar-header">
          <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar-collapse-3" aria-expanded="false">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand" href="*"><img src="/resources/img/sword-icon.png" alt="no img found" /></a>

        </div>

        <!-- Collect the nav links, forms, and other content for toggling -->
        <div class="collapse navbar-collapse" id="navbar-collapse-3">
          <ul class="nav navbar-nav" *ngIf="auth.authenticated()">
            <li>  <a [routerLink]="['Profile']">{{auth.userProfile.nickname}}: {{auth.userProfile.user_metadata.score}}</a></li>
          </ul>
          <ul class="nav navbar-nav navbar-right">
            <li class="divider"><a href="#">Quests</a></li>
            <li><a href="#">ScoreBoard</a></li>
            <li *ngIf="!auth.authenticated()" class="divider"><a (click)="auth.login()">Login</a></li>
            <li *ngIf="auth.authenticated()" class="divider"><a (click)="auth.logout()">Logout</a></li>
          </ul>
        </div><!-- /.navbar-collapse -->
      </div><!-- /.container-fluid -->
    </nav>
    <button (click)="addToScore(-5)">Add</button>
    <button (click)="upload()">Upload</button>
    <button (click)="download()">Download</button>
    <router-outlet></router-outlet>
    `,
  providers: [ Auth , FirebaseService ],
  directives: [ ROUTER_DIRECTIVES ]
})
@RouteConfig([
  {path: "/profile", name: "Profile", component: ProfileComponent}
])
export class AppComponent {
  response: string;

  constructor(private _firebaseService: FirebaseService, private auth: Auth, private authHttp: AuthHttp) {}

  upload(){
    this._firebaseService.setQuest (new Quest("Destiny", "Adventure", "Amusement Park", 97006))
      .subscribe(
        quest => this.response = JSON.stringify(quest),
        error => console.log(error)
      );
  }

  download(){
    this._firebaseService.getQuest()
      .subscribe(
        quest => console.log(quest),
        error => console.log(error)
      );
  }
  addToScore(num) {
    var newScore = this.auth.userProfile.user_metadata.score + num;
    var headers: any = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    var data: any = JSON.stringify({
      user_metadata: {
        score: newScore
      }
    });

    this.authHttp
      .patch('https://' + 'callanmcnulty.auth0.com' + '/api/v2/users/' + this.auth.userProfile.user_id, data, {headers: headers})
      .subscribe(
        response => {
        	//Update profile
          var storage = JSON.parse(localStorage.getItem('profile'));
          storage.user_metadata.score = newScore;
          this.auth.userProfile.user_metadata.score = newScore;
        },
        error => alert(error.json().message)
      );
  }
}

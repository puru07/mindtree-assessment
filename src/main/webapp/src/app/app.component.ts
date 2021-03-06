import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './services/auth.service';

@Component({
  selector: 'mind-tree-app',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class MindTreeAppComponent {
  constructor(private router_: Router, private auth_: AuthService) {
  }
  
  isSignedIn(): boolean {
    return this.auth_.isSignedIn();
  }

  signIn() {
    this.auth_.signIn();
  }

  signOut() {
    this.auth_.signOut();
  }
}

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, HostBinding, OnInit } from '@angular/core';
import { faGithub } from '@fortawesome/free-brands-svg-icons'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'client';
  faGithub = faGithub;

  ngOnInit() {}

  // The HostBinding allows us to add the class to the component itself, rather
  // than any of its children, thus removing the need for us to add any explicit
  // parent container inside.
  // https://zoaibkhan.com/blog/angular-material-dark-mode-in-3-steps/
  @HostBinding('class') className = '';

  constructor(private overlayContainer: OverlayContainer) {}

  setDarkMode(darkMode: boolean) {
    const darkClassName = 'darkMode';
    this.className = darkMode? darkClassName : '';
    if (darkMode) {
      // set dark theme on the dialogs
      this.overlayContainer
        .getContainerElement()
        .classList.add(darkClassName);
    } else {
      this.overlayContainer
        .getContainerElement()
        .classList.remove(darkClassName);
    }
  }
}

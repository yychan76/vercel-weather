import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, HostBinding, ViewChild } from '@angular/core';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { LoggerService } from './common/services/logger.service';
import { DarkModeToggleComponent } from './components/dark-mode-toggle/dark-mode-toggle.component';

const darkClassName = 'darkMode';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'client';
  faGithub = faGithub;

  // The HostBinding allows us to add the class to the component itself, rather
  // than any of its children, thus removing the need for us to add any explicit
  // parent container inside.
  // https://zoaibkhan.com/blog/angular-material-dark-mode-in-3-steps/
  @HostBinding('class') className!: string;

  @ViewChild(DarkModeToggleComponent)
  darkModeToggleComponent!: DarkModeToggleComponent;

  constructor(
    private overlayContainer: OverlayContainer,
    private logger: LoggerService
  ) {}

  ngAfterViewInit() {
    this.logger.tick_then(() => {
      this.darkModeToggleComponent.setDarkMode();
      this.className = this.darkModeToggleComponent.darkModeEnabled
        ? darkClassName
        : '';
      console.info('className', this.className);
    });
  }

  setDarkMode(darkMode: boolean) {
    this.className = darkMode ? darkClassName : '';
    if (darkMode) {
      // set dark theme on the dialogs
      this.overlayContainer.getContainerElement().classList.add(darkClassName);
    } else {
      this.overlayContainer
        .getContainerElement()
        .classList.remove(darkClassName);
    }
  }
}

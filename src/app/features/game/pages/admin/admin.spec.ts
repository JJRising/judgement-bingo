import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { Admin } from './admin';

describe('Admin', () => {
  let component: Admin;
  let fixture: ComponentFixture<Admin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Admin],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: (key: string) => 'test-game-id' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Admin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set gameId from route params', () => {
    expect(component.gameId()).toBe('test-game-id');
  });
});

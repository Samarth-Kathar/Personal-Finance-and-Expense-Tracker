import { UserProfile } from '../types';

/**
 * =====================================================================
 * ENCAPSULATION & DATA HIDING
 * The User class strictly encapsulates credentials and user profile
 * information. Passwords and internal state are protected from direct
 * external modification, accessed only through validation methods.
 * =====================================================================
 */
export class User {
  // Private encapsulated credentials
  private _username: string;
  private _passwordHash: string; // Plain demo credential string or hashed representation
  
  // Public profile properties
  public name: string;
  public accountType: string;
  public purpose: string;
  public currencyPreference: string;
  public profilePic: string;
  public college: string;
  public academicYear: string;
  private _isLoggedIn: boolean = false;

  // Default credentials mandated by the prompt
  public static readonly DEFAULT_USERNAME = 'Samarth Kathar';
  public static readonly DEFAULT_PASSWORD = 'Samarth07';

  constructor(profile?: Partial<UserProfile>, password?: string) {
    this._username = profile?.username || User.DEFAULT_USERNAME;
    this._passwordHash = password || User.DEFAULT_PASSWORD;
    this.name = profile?.name || 'Samarth Kathar';
    this.accountType = profile?.accountType || 'Student';
    this.purpose = profile?.purpose || 'Personal Finance Management';
    this.currencyPreference = profile?.currencyPreference || '₹';
    this.profilePic = profile?.profilePic || '/src/assets/images/profile_samarth_avatar_1791019657015.jpg';
    this.college = profile?.college || 'Engineering & Technology College';
    this.academicYear = profile?.academicYear || '2nd Year B.Tech Computer Engineering';
  }

  // Getter for username (read-only encapsulation)
  get username(): string {
    return this._username;
  }

  get isLoggedIn(): boolean {
    return this._isLoggedIn;
  }

  /**
   * ENCAPSULATION
   * Authenticates entered credentials against encapsulated credentials.
   */
  public login(enteredUsername: string, enteredPass: string): boolean {
    const isUserValid = enteredUsername.trim().toLowerCase() === this._username.trim().toLowerCase();
    const isPassValid = enteredPass === this._passwordHash;

    if (isUserValid && isPassValid) {
      this._isLoggedIn = true;
      return true;
    }
    return false;
  }

  /**
   * Logs out the user while preserving stored session data
   */
  public logout(): void {
    this._isLoggedIn = false;
  }

  /**
   * Updates profile metadata while encapsulating critical attributes
   */
  public updateProfile(updates: Partial<UserProfile>): void {
    if (updates.name) this.name = updates.name.trim();
    if (updates.accountType) this.accountType = updates.accountType.trim();
    if (updates.purpose) this.purpose = updates.purpose.trim();
    if (updates.currencyPreference) this.currencyPreference = updates.currencyPreference;
    if (updates.profilePic) this.profilePic = updates.profilePic;
    if (updates.college) this.college = updates.college;
    if (updates.academicYear) this.academicYear = updates.academicYear;
  }

  /**
   * Exports sanitized public profile for localStorage persistence
   */
  public toProfileJSON(): UserProfile {
    return {
      name: this.name,
      username: this._username,
      accountType: this.accountType,
      purpose: this.purpose,
      currencyPreference: this.currencyPreference,
      profilePic: this.profilePic,
      college: this.college,
      academicYear: this.academicYear,
    };
  }

  /**
   * Restores user from stored profile
   */
  public static fromStored(data?: Partial<UserProfile>): User {
    return new User(data);
  }
}

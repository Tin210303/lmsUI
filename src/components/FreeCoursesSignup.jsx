import React from 'react';
import '../assets/css/free-courses.css';

function FreeCoursesSignup() {
    return (
        <section className="free-courses-section">
            <div className="free-courses-container">
                {/* Left Column - Signup Form */}
                <div className="signup-column">
                <div className="online-courses-banner">
                    <p>Online Courses <em>for Free</em></p>
                </div>

                <div className="signup-content">
                    <h2>START MY FREE MONTH</h2>
                    <p>Stay Sharp. Get ahead with Learning Paths.</p>

                    <form className="signup-form">
                        <div className="form-group">
                            <input type="text" placeholder="Your name" className="form-control" />
                        </div>
                        <div className="form-group">
                            <input type="email" placeholder="Your email address" className="form-control" />
                        </div>
                        <div className="form-group">
                            <input type="tel" placeholder="Your phone number" className="form-control" />
                        </div>
                        <button type="submit" className="apply-button">APPLY NOW</button>
                    </form>
                </div>
                </div>

                {/* Right Column - Info Tabs */}
                <div className="info-column">
                    <div className="tabs-container">
                        <div className="tabs-header">
                            <div className="tab active">FACILITY</div>
                            <div className="tab">E-LEARNING</div>
                            <div className="tab">VOYABULARY</div>
                            <div className="tab">KID'S COURSES</div>
                        </div>

                        <div className="tab-content">
                            <div className="content-section">
                                <div className="text-content">
                                    <h3>Limitless Learning Possibilities</h3>
                                    <p>
                                        Lorem Ipsn gravida nibh vel velit auctor aliquet. Aenean sollicitudin, lorem quis bibendum auci elit consequat ipsutis sem nibh id elit. Duis sed odio sit amet nibh vulputate cursus a sit amet mauris. Morbi accumsan ipsum velit. Nam nec tellus a odio tincidunt aucto.
                                    </p>
                                    <h4>Register Now!</h4>
                                    <p>
                                        Per inceptos himenaeos. Mauris in erat justo. Nullam ac urna eu felis dapibus condntum sit amet a augue. Sed non mauris vitae erat consequat auctor eu in elit. Class aptento taciti sociosqu ad litora torquent.
                                    </p>
                                </div>
                                <div className="video-preview">
                                    <div className="video-thumbnail">
                                        <div className="play-button">
                                            <i className="play-icon">▶</i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default FreeCoursesSignup;
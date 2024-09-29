//Footer.jsx

import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
    return (
        <footer>
            <div className='footerDiv'>
            <div className="footer-content">
                <div className="footer-section about">
                <a href="https://fractalz.xyz">
              <div className="logo-footer">
                <img src="/beast-art-neu.svg" alt="Logo" />
              </div>
            </a>
            <div className='footerdescription'>
                    <p>
                    The first NFT marketplace on IOTA, offering opportunities for EX-Soonaverse projects. From the community, for the community.
                    </p>
            </div>

                    <div className="social-iconDiv">
                        <a href="https://x.com/tanglebeasts">
                        <img className="social-icons" src="/x.png" alt="x" />
                        </a>
                        <a href="https://discord.com/invite/zeMwbxhJuU">
                        <img className="social-icons" src="/discord.png" alt="discord" />
                        </a>
                    </div>

                </div>
                <div className="footer-section links">
                    <h2>Information</h2>
                    {/* <ul>
                        <li><a href="https://fractalz.xyz">Homepage</a></li>
                        <li><a href="/about">About</a></li>
                        <li><a href="/faucet">Faucets</a></li>
                        <li><a href="https://fractalz.xyz/?artistmodalopen=true">Become Artist</a></li>
                        <li><a href="/faq">FAQ</a></li>
                    </ul> */}
                </div>
                <div className="footer-section contact VisibleLink">
                    <h2>Contact Us</h2>
                    {/* <ul>
                    <li><a href="https://fractalz.xyz/contact">Contact us</a></li>
                    </ul> */}
                </div>
            </div>
            <div className="footer-bottom VisibleLink">
                &copy; 2024 Beast-Art all rights reserved | <a href="/imprint">Imprint</a> | <a href="/terms">Terms of Use</a> | <a href="/privacy">Privacy Policy</a>
            </div>
            </div>
        </footer>
    );
};

export default Footer;

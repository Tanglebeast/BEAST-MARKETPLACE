import React from 'react';
import '../styles/Imprint.css'

const Imprint = () => {
  return (
    <div className='flex column centered w100'>
        <div className='w40'>
      <h2 className='text-align-center mb30'>Imprint</h2>

      <section className='imprint-link mb30 mt10'>
        <h3 className='mb5'>Website</h3>
        <p className='mt5'>This imprint applies to all offers under the domain <a href="https://fractalz.xyz">https://fractalz.xyz</a> including all subdomains.</p>
      </section>

      <section className='mb30'>
        <h3 className='mb5'>Information according to § 5 TMG</h3>
        <p className='mt5'>
          Marvin Guellier<br />
          Herrenbergstr. 30<br />
          77815, Bühl<br />
          Phone: +49 152 5412 7399<br />
          <div className='VisibleLink'>Email: <a href="mailto:support@fractalz.xyz">support@fractalz.xyz</a></div>
        </p>
      </section>

      <section className='mb30'>
        <h3 className='mb5'>VAT Identification Number</h3>
        <p className='mt5'>42681993078</p>
      </section>
      </div>
    </div>
  );
};

export default Imprint;

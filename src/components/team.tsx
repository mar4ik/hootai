import React from 'react'

export default function TeamContent() {
  // Team member data
  const teamMembers = [
    {
      name: "Mariam Morozova",
      role: "Co-Founder",
      bio: "Experienced product designer, graphic artist with frontend skills with over 15 years of experience in tech by day. Painter and furniture designer by night.",
      image: "/images/mariam.jpg", // You can add actual images later
      email: "mariam.morozova@gmail.com",
      linkedin: "https://linkedin.com/in/mariammorozova",
      website: "https://mariammorozova.com/"
    },
    {
      name: "EunJee Hong",
      role: "Co-Founder",
      bio: "With a background in business and design, I've worked as an architect, product designer, and product manager—launching products from scratch in startup environments. I'm passionate about building intuitive web platforms, mobile apps, and 3D experiences that drive growth and elevate user experience.",
      image: "/images/eunJee.jpeg",
      email: "eunzie@gmail.com",
      linkedin: "https://www.linkedin.com/in/eunjee/",
      website: "https://www.brand-tecture.com/"
    },
    // {
    //   name: "Super Hero",
    //   role: "we need engineers",
    //   bio: "Experienced UX researcher with a background in cognitive psychology. Helps shape Hoot.ai's analysis methodology and insights.",
    //   image: "/team/sarah.jpg",
    //   // email: "sarah@hoot.ai",
    //   // linkedin: "https://linkedin.com/in/sarahjohnson"
    // }
  ];

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-5 sm:p-6 md:p-8 my-4 sm:my-6">
      <h1 className="text-[24px] font-bold mb-6 sm:mb-8 flex items-center">
        <span className="mr-2 text-xl sm:text-2xl">👥</span> Our Team
      </h1>
      
      <div className="space-y-4 sm:space-y-6 mb-8">
        <p className="text-[14px] text-gray-800">
          Meet the talented individuals behind Hoot.ai. We're a passionate team dedicated to improving user experiences through AI-powered insights.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {teamMembers.map((member, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-24 h-24 rounded-full bg-gray-200 mb-3 overflow-hidden">
                {/* Replace with actual image when available */}
                <div className="w-full h-full flex items-center justify-center text-3xl">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <h3 className="text-lg font-semibold">{member.name}</h3>
              <p className="text-sm">{member.role}</p>
            </div>
            
            <p className="text-[14px] text-gray-700 mb-4">
              {member.bio}
            </p>
            
            <div className="flex justify-center space-x-4">
              <a 
                href={`mailto:${member.email}`} 
                className="text-indigo-500 hover:text-indigo-600 hover:underline text-sm"
              >
                ✉️ Email
              </a>
              <a 
                href={member.linkedin} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-indigo-500 hover:text-indigo-600 hover:underline text-sm"
              >
                💼 LinkedIn
              </a>
              <a 
                href={member.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-indigo-500 hover:text-indigo-600 hover:underline text-sm"
              >
                🎨 Website
              </a>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-lg font-semibold mb-4">🍀 Find this interesting?</h2>
        <p className="text-[14px] text-gray-800 mb-4">
          We are still looking for people who want to join us in building this awesome product.
          If you're interested in joining our team, contact us at <a href="mailto:mariam.morozova@gmail.com" className="text-indigo-500 hover:text-indigo-600 hover:underline">mariam.morozova@gmail.com</a> or <a href="mailto:eunzie@gmail.com" className="text-indigo-500 hover:text-indigo-600 hover:underline">eunzie@gmail.com</a>.
        </p>
      </div>
      <div className="border-t border-gray-200 pt-6 text-center">
      <a href="https://ko-fi.com/U6U31FN5A7" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <button style={{
              backgroundColor: '#FFDA6E',
              color: '#202020',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 13px',
              fontSize: '14px',
              fontWeight: 'bold',
              marginTop: '1em',
              cursor: 'pointer'
            }}>
              ❤️ Help us build Hoot.ai
          </button>
          </a>
          </div>
    </div>
  )
} 
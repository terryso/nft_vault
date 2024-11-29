const About = () => {
  const skills = [
    "Innovation",
    "Creativity",
    "Problem Solving",
    "Leadership",
    "Communication",
    "Collaboration",
  ];

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
            About Me
          </h2>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="prose max-w-none">
              <p className="text-gray-600 mb-6">
                Hello! I'm Cool Creepz, a passionate professional who loves to create and innovate. 
                My journey is driven by curiosity, creativity, and a desire to make a meaningful impact.
              </p>
              <p className="text-gray-600 mb-8">
                I specialize in bringing unique ideas to life, whether through technology, design, or 
                problem-solving. With a keen eye for detail and a commitment to excellence, I strive 
                to deliver exceptional results in everything I do.
              </p>
            </div>
            
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

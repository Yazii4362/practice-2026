// JavaScript Code

document.addEventListener('DOMContentLoaded', function() {
  console.log('SOYO HANNAM - Project loaded successfully!');
  
  // Video Background Control
  const video = document.querySelector('.video-background video');
  
  if (video) {
    // Ensure video plays on mobile devices
    video.play().catch(error => {
      console.log('Video autoplay failed:', error);
    });
    
    // Optional: Add video controls
    video.addEventListener('loadeddata', function() {
      console.log('Video loaded successfully');
    });
  }
  
  // Smooth scroll behavior (for future sections)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});


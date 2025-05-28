import React, { useState, useEffect } from 'react'
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"

export default function AboutContent() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Check if any field is filled to enable the submit button
  useEffect(() => {
    const hasValue = Object.values(formData).some(value => value.trim() !== '');
    setIsFormValid(hasValue);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In a real app, this would send an email to mariam.morozova@gmail.com
      // Simulating email submission
      console.log(`Sending feedback to mariam.morozova@gmail.com:
        From: ${formData.name} (${formData.email})
        Message: ${formData.message}
      `);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      
      // Reset success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto bg-gray-50 font-istok">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-5 sm:p-6 md:p-8 my-4 sm:my-6">
        <h1 className="text-[24px] font-bold mb-6 sm:mb-8 flex items-center">
          <span className="mr-2 text-xl sm:text-2xl">🤔</span> About Hoot.ai
        </h1>
        
        <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-10">
          <h2 className="text-[14px] text-gray-800 font-normal">
          👋 Hey we are building Hoot.ai a tool that helps UX and product folks spot the actual problems in their software (not just vague charts and heatmaps). It uses AI to find patterns in user data and tells you where things are going wrong  so you can fix it before your users rage-quit.

If you donate It helps me keep building, testing, and occasionally sleeping.
            {/* It all started with a mission to help anyone building amazing products quickly 
            find user gaps and improve UX. */}
          </h2>
          
          <p className="text-[14px] text-gray-800">
            Hoot.ai uses AI to spot issues and suggest fixes, so you spend less time guessing and more time improving.
            We start with simple CSV and PDF files, but we&apos;re planning to connect to more tools in the future.
          </p>
          
          <p className="text-[14px] flex items-center text-gray-800">
            We&apos;re still shaping Hoot.ai, so your feedback and ideas really matter.
            If you donate It helps me keep building, testing, and occasionally sleeping. Thanks for the support ❤️
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 shadow-sm text-sm sm:text-base">
              Thank you for your feedback! We&apos;ll get back to you soon.
            </div>
          )}
          
          <div>
            <label htmlFor="name" className="block text-base sm:text-lg font-medium mb-1.5 sm:mb-2 text-gray-700">Name</label>
            <Input 
              id="name" 
              placeholder="Enter your name here" 
              className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-base sm:text-lg font-medium mb-1.5 sm:mb-2 text-gray-700">Email</label>
            <Input 
              id="email" 
              type="email" 
              placeholder="Enter your email here" 
              className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-base sm:text-lg font-medium mb-1.5 sm:mb-2 text-gray-700">Message</label>
            <Textarea 
              id="message" 
              placeholder="Enter your message here" 
              className="w-full p-2 sm:p-3 text-sm sm:text-base min-h-24 sm:min-h-32 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>
          
          <input type="hidden" name="recipient" value="mariam.morozova@gmail.com" />
          <div style={{maxWidth: '50%', margin: '3em auto'}}>
          <Button 
            type="submit" 
            variant="outline"
            className="w-full p-2.5 sm:p-3 text-base sm:text-lg rounded-lg shadow-md transition-all hover:shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-4 focus:ring-indigo-300 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 disabled:hover:shadow-md mt-2"
            disabled={isSubmitting || !isFormValid}
          >
            {isSubmitting ? 'Sending...' : 'Send your feedback'}
          </Button>
          </div>
        </form>
        <div style={{maxWidth: '50%', margin: '3em auto', textAlign: 'center'}}>
        <a href="https://ko-fi.com/U6U31FN5A7" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <button style={{
                backgroundColor: '#FFDA6E',
                color: '#202020',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 13px',
                fontSize: '14px',
                fontWeight: 'bold',
                margin: '1em auto',
                cursor: 'pointer'
              }}>
                ❤️ Help us build Hoot.ai
            </button>
            </a>

        </div>
      </div>
    </div>
  )
}
import { SignInButton } from '@clerk/nextjs';

const Guest = () => {
  return (
    <div className='font-sans bg-gradient-to-br from-gray-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900/20 text-gray-800 dark:text-gray-200 transition-all duration-300 min-h-screen'>
      {/* Hero Section */}
      <section className='relative overflow-hidden flex flex-col items-center justify-center text-center py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-teal-500/10 dark:from-emerald-900/30 dark:via-green-900/20 dark:to-teal-900/30'>
        <div className='absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10'></div>
        <div className='relative z-10 max-w-4xl mx-auto w-full'>
          <div className='inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6 shadow-lg'>
            <span className='w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse'></span>
            <span className='hidden sm:inline'>
              AI Chatbot • Lightning Fast • Redis Powered
            </span>
            <span className='sm:hidden'>AI Chatbot Powered</span>
          </div>
          <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-gray-100 leading-tight'>
            Welcome to{' '}
            <span className='bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 bg-clip-text text-transparent'>
              SpendWise.AI
            </span>
          </h1>
          <p className='text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto px-2 sm:px-0'>
            Chat naturally with our AI assistant to track expenses, get instant insights,
            and manage your budget. Just say &quot;I spent $15 on coffee&quot; and watch the magic happen!
          </p>
          <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-2 sm:px-0'>
            <SignInButton>
              <button className='group relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 hover:from-emerald-700 hover:via-green-600 hover:to-teal-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-200 transform hover:-translate-y-0.5'>
                <span className='relative z-10 flex items-center justify-center gap-2'>
                  Get Started Free
                  <span className='text-lg'>→</span>
                </span>
                <div className='absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200'></div>
              </button>
            </SignInButton>
            <button className='group border-2 border-emerald-500/20 dark:border-emerald-400/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all duration-200 backdrop-blur-sm'>
              Learn More
            </button>
          </div>

          {/* Feature highlights */}
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto px-2 sm:px-0'>
            <div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50'>
              <div className='w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg mb-3 sm:mb-4 mx-auto'>
                <span className='text-white text-base sm:text-lg'>💬</span>
              </div>
              <h3 className='text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 text-center'>
                AI Chatbot
              </h3>
              <p className='text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center'>
                Natural language expense tracking
              </p>
            </div>
            <div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50'>
              <div className='w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 via-teal-500 to-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg mb-3 sm:mb-4 mx-auto'>
                <span className='text-white text-base sm:text-lg'>⚡</span>
              </div>
              <h3 className='text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 text-center'>
                Lightning Fast
              </h3>
              <p className='text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center'>
                Redis-powered instant responses
              </p>
            </div>
            <div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 sm:col-span-2 md:col-span-1'>
              <div className='w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-teal-500 via-emerald-500 to-green-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg mb-3 sm:mb-4 mx-auto'>
                <span className='text-white text-base sm:text-lg'>🧠</span>
              </div>
              <h3 className='text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 text-center'>
                Smart Context
              </h3>
              <p className='text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center'>
                Multi-turn conversation memory
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className='py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-900/20 dark:via-green-900/20 dark:to-teal-900/20'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-10 sm:mb-12 md:mb-16'>
            <div className='inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6'>
              <span className='w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse'></span>
              Live Demo
            </div>
            <h2 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-gray-100 px-2 sm:px-0'>
              See the{' '}
              <span className='text-emerald-600 dark:text-emerald-400'>
                AI in Action
              </span>
            </h2>
            <p className='text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto px-2 sm:px-0'>
              Experience how natural and intuitive expense tracking can be with our conversational AI assistant.
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center'>
            {/* Chat Demo */}
            <div className='bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden'>
              <div className='bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 p-4 text-white'>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 bg-white/20 rounded-full flex items-center justify-center'>
                    <span className='text-sm'>🤖</span>
                  </div>
                  <div>
                    <div className='font-semibold'>SpendWise AI Assistant</div>
                    <div className='text-xs opacity-90'>Online • Lightning Fast</div>
                  </div>
                </div>
              </div>
              
              <div className='p-4 space-y-4 max-h-96 overflow-y-auto'>
                {/* User message */}
                <div className='flex justify-end'>
                  <div className='bg-emerald-500 text-white px-4 py-2 rounded-2xl rounded-br-md max-w-xs'>
                    <p className='text-sm'>I spent $15 on coffee this morning</p>
                  </div>
                </div>
                
                {/* AI response */}
                <div className='flex justify-start'>
                  <div className='bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-2xl rounded-bl-md max-w-xs'>
                    <p className='text-sm'>Perfect! I have added your $15 coffee expense to the Food & Dining category. ☕️</p>
                    <div className='mt-2 text-xs text-gray-500 dark:text-gray-400'>Expense saved instantly with Redis caching</div>
                  </div>
                </div>
                
                {/* User message */}
                <div className='flex justify-end'>
                  <div className='bg-emerald-500 text-white px-4 py-2 rounded-2xl rounded-br-md max-w-xs'>
                    <p className='text-sm'>What is my biggest expense category this month?</p>
                  </div>
                </div>
                
                {/* AI response */}
                <div className='flex justify-start'>
                  <div className='bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-2xl rounded-bl-md max-w-xs'>
                    <p className='text-sm'>Your biggest expense category this month is Food & Dining at $245. That is 35% of your total spending! 📊</p>
                  </div>
                </div>
                
                {/* Typing indicator */}
                <div className='flex justify-start'>
                  <div className='bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-2xl rounded-bl-md'>
                    <div className='flex space-x-1'>
                      <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'></div>
                      <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' style={{animationDelay: '0.1s'}}></div>
                      <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className='space-y-6'>
              <div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50'>
                <div className='flex items-center gap-4 mb-4'>
                  <div className='w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center'>
                    <span className='text-white text-lg'>💬</span>
                  </div>
                  <h3 className='text-lg font-bold text-gray-900 dark:text-gray-100'>
                    Natural Conversations
                  </h3>
                </div>
                <p className='text-gray-600 dark:text-gray-400 text-sm leading-relaxed'>
                  No forms or complex interfaces. Just chat naturally: &quot;I bought groceries for $50&quot; 
                  and our AI handles the rest with smart categorization.
                </p>
              </div>
              
              <div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50'>
                <div className='flex items-center gap-4 mb-4'>
                  <div className='w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center'>
                    <span className='text-white text-lg'>⚡</span>
                  </div>
                  <h3 className='text-lg font-bold text-gray-900 dark:text-gray-100'>
                    Instant Responses
                  </h3>
                </div>
                <p className='text-gray-600 dark:text-gray-400 text-sm leading-relaxed'>
                  Redis caching ensures lightning-fast responses. Your conversation history 
                  and insights load instantly, even with complex financial analysis.
                </p>
              </div>
              
              <div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50'>
                <div className='flex items-center gap-4 mb-4'>
                  <div className='w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center'>
                    <span className='text-white text-lg'>🧠</span>
                  </div>
                  <h3 className='text-lg font-bold text-gray-900 dark:text-gray-100'>
                    Context Memory
                  </h3>
                </div>
                <p className='text-gray-600 dark:text-gray-400 text-sm leading-relaxed'>
                  Our AI remembers your conversation context. Edit expenses, ask follow-up questions, 
                  or continue where you left off - it all flows naturally.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions Section */}
      <section className='py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm relative overflow-hidden'>
        <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500'></div>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center mb-10 sm:mb-12 md:mb-16'>
            <div className='inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6'>
              <span className='w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full'></span>
              FAQ
            </div>
            <h2 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-gray-100 px-2 sm:px-0'>
              Frequently Asked{' '}
              <span className='text-emerald-600 dark:text-emerald-400'>
                Questions
              </span>
            </h2>
            <p className='text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-2 sm:px-0'>
              Everything you need to know about SpendWise.AI and how it can
              transform your financial management.
            </p>
          </div>

          <div className='space-y-4 sm:space-y-6'>
            <div className='group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-200'>
              <div className='flex items-start gap-3 sm:gap-4'>
                <div className='w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-md sm:rounded-lg flex items-center justify-center shadow-lg flex-shrink-0'>
                  <span className='text-white text-xs sm:text-sm'>?</span>
                </div>
                <div className='flex-1'>
                  <h3 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3'>
                    What is SpendWise.AI?
                  </h3>
                  <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed'>
                    SpendWise.AI is a conversational expense tracker powered by OpenAI GPT-3.5-turbo.
                    Simply chat with our AI assistant to add expenses, analyze spending, and get
                    personalized insights. With Redis caching, every interaction is lightning-fast
                    and your conversation history is preserved.
                  </p>
                </div>
              </div>
            </div>

            <div className='group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-200'>
              <div className='flex items-start gap-3 sm:gap-4'>
                <div className='w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 via-teal-500 to-emerald-500 rounded-md sm:rounded-lg flex items-center justify-center shadow-lg flex-shrink-0'>
                  <span className='text-white text-xs sm:text-sm'>🤖</span>
                </div>
                <div className='flex-1'>
                  <h3 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3'>
                    How does the AI chatbot work?
                  </h3>
                  <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed'>
                    Our AI chatbot understands natural language and maintains conversation context.
                    Just type &quot;I spent $25 on groceries&quot; and it automatically categorizes and saves
                    your expense. Ask questions like &quot;What is my biggest expense category?&quot; or
                    &quot;Show me this month spending&quot; for instant insights with Redis-cached responses.
                  </p>
                </div>
              </div>
            </div>

            <div className='group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-200'>
              <div className='flex items-start gap-3 sm:gap-4'>
                <div className='w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-teal-500 via-emerald-500 to-green-500 rounded-md sm:rounded-lg flex items-center justify-center shadow-lg flex-shrink-0'>
                  <span className='text-white text-xs sm:text-sm'>💎</span>
                </div>
                <div className='flex-1'>
                  <h3 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3'>
                    Is SpendWise.AI free?
                  </h3>
                  <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed'>
                    Yes, SpendWise.AI offers a free plan with basic AI
                    features including smart categorization and insights.
                    Premium plans are available for advanced AI analytics and
                    unlimited AI interactions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className='py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-gray-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900/20'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-10 sm:mb-12 md:mb-16'>
            <div className='inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6'>
              <span className='w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full'></span>
              Testimonials
            </div>
            <h2 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-gray-100 px-2 sm:px-0'>
              What Our Users{' '}
              <span className='text-emerald-600 dark:text-emerald-400'>
                Say
              </span>
            </h2>
            <p className='text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-2 sm:px-0'>
              Join thousands of satisfied users who have transformed their
              financial habits with SpendWise.AI.
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8'>
            <div className='group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-200 hover:-translate-y-1'>
              <div className='absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200'></div>
              <div className='relative z-10'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg'>
                    <span className='text-white text-xs sm:text-sm font-bold'>
                      S
                    </span>
                  </div>
                  <div>
                    <div className='font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base'>
                      Sarah L.
                    </div>
                    <div className='text-xs sm:text-sm text-gray-500 dark:text-gray-400'>
                      Verified User
                    </div>
                  </div>
                </div>
                <p className='text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4'>
                  &ldquo;The AI chatbot is amazing! I just tell it I spent $20 on lunch 
                  and it is instantly categorized. The conversation feels so natural and 
                  the responses are lightning fast!&rdquo;
                </p>
                <div className='flex text-emerald-500 text-xs sm:text-sm'>
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
            </div>

            <div className='group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-200 hover:-translate-y-1'>
              <div className='absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-500/5 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200'></div>
              <div className='relative z-10'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 via-teal-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg'>
                    <span className='text-white text-xs sm:text-sm font-bold'>
                      J
                    </span>
                  </div>
                  <div>
                    <div className='font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base'>
                      John D.
                    </div>
                    <div className='text-xs sm:text-sm text-gray-500 dark:text-gray-400'>
                      Verified User
                    </div>
                  </div>
                </div>
                <p className='text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4'>
                  &ldquo;I love how I can just chat with the AI to track expenses. 
                  It remembers our conversation context and gives instant insights. 
                  The Redis caching makes everything super fast!&rdquo;
                </p>
                <div className='flex text-emerald-500 text-xs sm:text-sm'>
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
            </div>

            <div className='group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-200 hover:-translate-y-1 sm:col-span-2 lg:col-span-1'>
              <div className='absolute inset-0 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200'></div>
              <div className='relative z-10'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-teal-500 via-emerald-500 to-green-500 rounded-full flex items-center justify-center shadow-lg'>
                    <span className='text-white text-xs sm:text-sm font-bold'>
                      E
                    </span>
                  </div>
                  <div>
                    <div className='font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base'>
                      Emily R.
                    </div>
                    <div className='text-xs sm:text-sm text-gray-500 dark:text-gray-400'>
                      Verified User
                    </div>
                  </div>
                </div>
                <p className='text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4'>
                  &ldquo;The conversational interface is revolutionary! I can ask 
                  What is my biggest expense and get detailed analysis instantly. 
                  It is like having a financial advisor in my pocket!&rdquo;
                </p>
                <div className='flex text-emerald-500 text-xs sm:text-sm'>
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Guest;
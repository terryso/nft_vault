import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Navbar = () => {
  const [address, setAddress] = useState('')
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    // 初始检查
    checkMobile()

    // 监听窗口大小变化
    window.addEventListener('resize', checkMobile)

    // 清理监听器
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (address.trim()) {
      navigate(`/account/${address.trim()}`)
      setAddress('')
    }
  }

  return (
    <nav className="bg-white shadow-lg fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary hover:text-primary-dark transition-colors">
              NFT Vault
            </Link>
          </div>
          {!isMobile && (
            <div className="flex items-center">
              <form onSubmit={handleSubmit} className="flex items-center">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter wallet address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-[500px] h-10 px-4 rounded-lg border border-gray-300 bg-white"
                    style={{ color: '#000000' }}
                  />
                </div>
                <button
                  type="submit"
                  className="h-10 px-6 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ml-2"
                >
                  View Gallery
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar

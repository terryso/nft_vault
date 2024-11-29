import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import placeholderImage from '../assets/placeholder-nft.svg';

const NFTDetail = () => {
  const { contractAddress, tokenId } = useParams();
  const [nft, setNft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const requestSent = useRef(false);

  useEffect(() => {
    const fetchNFTDetails = async () => {
      if (!contractAddress || !tokenId || requestSent.current) return;

      requestSent.current = true;
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `https://api.opensea.io/api/v2/chain/ethereum/contract/${contractAddress}/nfts/${tokenId}`,
          {
            headers: {
              'X-API-KEY': import.meta.env.NFT_OPENSEA_API_KEY,
            },
          }
        );
        setNft(response.data.nft);
      } catch (err) {
        console.error('Error fetching NFT details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // 滚动到页面顶部并获取 NFT 详情
    window.scrollTo(0, 0);
    fetchNFTDetails();
  }, []); // 只在组件挂载时执行一次

  // 检查媒体类型
  const getMediaType = (nft) => {
    const imageUrl = nft.image_url || '';
    const mimeType = nft.mime_type || '';
    
    if (mimeType.startsWith('video/') || imageUrl.match(/\.(mp4|webm|ogg)$/i)) {
      return 'video';
    }
    return 'image';
  };

  // 渲染NFT媒体内容
  const renderNFTMedia = (nft) => {
    const mediaType = getMediaType(nft);
    const url = nft.image_url || '';

    if (mediaType === 'video') {
      return (
        <>
          <video
            src={url}
            className="w-full h-full object-cover rounded-lg shadow-lg"
            controls
            loop
            playsInline
            autoPlay
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <img
            src={placeholderImage}
            alt="Placeholder"
            className="w-full h-full object-cover rounded-lg shadow-lg hidden"
          />
        </>
      );
    }

    return (
      <img
        src={url || placeholderImage}
        alt={nft.name}
        className="w-full h-full object-cover rounded-lg shadow-lg"
        onError={(e) => {
          e.target.src = placeholderImage;
        }}
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-xl text-gray-600">Loading NFT details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <Link to="/" className="mt-4 text-primary hover:text-primary-dark">
            Back to Gallery
          </Link>
        </div>
      </div>
    );
  }

  if (!nft) {
    return (
      <div className="min-h-screen bg-gray-100 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-gray-600">NFT not found</p>
          <Link to="/" className="mt-4 text-primary hover:text-primary-dark">
            Back to Gallery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-primary hover:text-primary-dark"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Gallery
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-6">
            <div className="aspect-w-1 aspect-h-1 mb-6">
              {renderNFTMedia(nft)}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {nft.name || 'Unnamed NFT'}
            </h1>

            {nft.description && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{nft.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Details</h2>
                <dl className="space-y-3">
                  {nft.collection && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Collection</dt>
                      <dd className="text-sm text-gray-900">
                        <a
                          href={`https://opensea.io/collection/${nft.collection.toLowerCase()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-dark inline-flex items-center"
                        >
                          {nft.collection}
                          <svg
                            className="w-4 h-4 ml-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Token ID</dt>
                    <dd className="text-sm text-gray-900">{nft.identifier}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Contract Address</dt>
                    <dd className="text-sm text-gray-900 break-all">{nft.contract}</dd>
                  </div>
                  {nft.token_standard && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Token Standard</dt>
                      <dd className="text-sm text-gray-900">{nft.token_standard}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Links</h2>
                <div className="space-y-3">
                  <a
                    href={`https://opensea.io/assets/ethereum/${nft.contract}/${nft.identifier}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary hover:text-primary-dark"
                  >
                    <span>View on OpenSea</span>
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTDetail;
